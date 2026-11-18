import { produce } from 'immer'
import { create } from 'zustand'
import { createProject } from '../core/defaults'
import { footprint, normalizeRotation, overlapDepth, placementRect, rectsBounds, round3 } from '../core/geometry'
import { autoPairCycles, formatCycles, parseCycles } from '../core/gripper'
import {
  alignItems,
  autoOrder,
  centerOnPallet,
  compactOrders,
  getLayer,
  moveOrder,
  nextId,
  rotatedLayerB,
  rotateItems,
  sortedByOrder,
  syncLinkedLayers,
  type AlignMode,
  type OrderStrategy,
} from '../core/layers'
import type { Corner, LayerName, Pallet, Placement, Product, Project, Robot, Rotation, SlipSheet } from '../core/types'
import type { FileHandleLike } from './fileAccess'
import { loadAutosave, loadPrefs, type Prefs } from './persistence'

export type ViewMode = 'layout' | 'stack' | 'code'
export type Step = 'pallet' | 'product' | 'layers' | 'gripper' | 'robot'
export type RightTab = 'selection' | 'order' | 'validation'
export type Tool = 'select' | 'measure' | 'order'
export type DialogId = 'generator' | 'cycles' | 'shortcuts' | 'diagnostics'
export type ThemePref = 'light' | 'dark' | 'system'
export type CoordMode = 'board' | 'base'

export interface Toast {
  id: number
  kind: 'success' | 'error' | 'info'
  message: string
}

export interface ConfirmRequest {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
}

interface UpdateOptions {
  /** Kolejne zmiany z tym samym kluczem w krótkim odstępie tworzą jeden krok cofania. */
  coalesce?: string
  /** Zmiana w trakcie gestu (przeciąganie) – bez osobnego wpisu w historii. */
  transient?: boolean
}

export interface AppState extends Prefs {
  project: Project
  past: Project[]
  future: Project[]
  savedProject: Project | null
  fileName: string | null
  fileHandle: FileHandleLike | null
  /** Czy przy starcie przywrócono projekt z autozapisu. */
  restored: boolean

  activeLayer: LayerName
  selection: number[]
  view: ViewMode
  step: Step
  rightTab: RightTab
  tool: Tool
  orderCursor: number
  dialog: DialogId | null
  confirm: ConfirmRequest | null
  toasts: Toast[]
  clipboard: Placement[]
  /** Licznik żądań dopasowania widoku 2D do okna. */
  fitRequest: number

  update: (recipe: (draft: Project) => void, options?: UpdateOptions) => void
  beginGesture: () => void
  endGesture: () => void
  undo: () => void
  redo: () => void

  newProject: () => void
  loadProject: (project: Project, fileName?: string | null, handle?: FileHandleLike | null) => void
  markSaved: (fileName: string | null, handle: FileHandleLike | null) => void

  setName: (name: string) => void
  setPallet: (patch: Partial<Pallet>) => void
  setProduct: (patch: Partial<Product>) => void
  setRobot: (patch: Partial<Robot>) => void
  setSlipSheet: (patch: Partial<SlipSheet>) => void

  setActiveLayer: (layer: LayerName) => void
  createLayerB: (mode: 'rot180' | 'copy') => void
  removeLayerB: () => void
  setLayerBLink: (linked: boolean) => void

  select: (ids: number[]) => void
  toggleSelect: (id: number) => void
  selectAll: () => void
  addItem: (at?: { x: number; y: number }) => void
  deleteSelected: () => void
  rotateSelected: (delta?: number) => void
  duplicateSelected: () => void
  copySelected: () => void
  paste: () => void
  nudgeSelected: (dx: number, dy: number) => void
  moveItems: (positions: Map<number, { x: number; y: number }>, transient?: boolean) => void
  patchItem: (id: number, patch: Partial<Pick<Placement, 'x' | 'y' | 'rotation'>>) => void
  setItemOrder: (id: number, order: number) => void
  clickOrder: (id: number) => void
  applyAutoOrder: (strategy: OrderStrategy, corner: Corner) => void
  renumber: () => void
  alignSelected: (mode: AlignMode) => void
  centerLayer: () => void
  clearLayer: () => void
  applyPattern: (items: Placement[]) => void
  autoPair: () => void

  setView: (view: ViewMode) => void
  setStep: (step: Step) => void
  setRightTab: (tab: RightTab) => void
  setTool: (tool: Tool) => void
  setPrefs: (patch: Partial<Prefs>) => void
  openDialog: (dialog: DialogId | null) => void
  askConfirm: (request: ConfirmRequest | null) => void
  toast: (message: string, kind?: Toast['kind']) => void
  dismissToast: (id: number) => void
  requestFit: () => void
}

const HISTORY_LIMIT = 200
const COALESCE_MS = 1200

let lastCoalesceKey: string | null = null
let lastCoalesceTime = 0
let gestureSnapshot: Project | null = null
let toastSeq = 0

/** Czy aktywną warstwę można edytować (powiązana warstwa B jest tylko do odczytu). */
export function isLayerEditable(project: Project, layer: LayerName): boolean {
  if (layer === 'A') return true
  return !!project.layers.B && project.layers.B.link === null
}

function editLayer(draft: Project, layer: LayerName, fn: (items: Placement[]) => Placement[]) {
  if (!isLayerEditable(draft, layer)) return
  const target = layer === 'B' ? draft.layers.B! : draft.layers.A
  target.items = fn(target.items)
}

/** Po zmianie numeracji w warstwie A przepisuje cykle chwytaka na nowe numery produktów. */
function remapAssignments(raw: string, map: Map<number, number>): string {
  return raw
    .split(';')
    .map((cycle) =>
      cycle
        .split(',')
        .map((token) => {
          const m = /^\s*(\d+)\s*=\s*(\d+)\s*$/.exec(token)
          if (!m) return token.trim()
          const mapped = map.get(Number(m[1]))
          return mapped === undefined ? '' : `${mapped}=${m[2]}`
        })
        .filter(Boolean)
        .join(','),
    )
    .filter(Boolean)
    .join(';')
}

function appendToCycles(raw: string, existingOrders: number[], newOrder: number): string {
  const parsed = parseCycles(raw, existingOrders)
  if (existingOrders.length > 0 && parsed.errors.length) return raw
  const cycles = parsed.cycles
  const last = cycles[cycles.length - 1]
  if (last && last.length === 1) last.push({ product: newOrder, section: last[0].section === 1 ? 2 : 1 })
  else cycles.push([{ product: newOrder, section: 1 }])
  return formatCycles(cycles)
}

/** Pierwsze wolne miejsce na palecie dla nowego produktu (rzędami od narożnika A). */
function freeSpot(project: Project, layer: LayerName): { x: number; y: number } {
  const { pallet, product } = project
  const [w, h] = footprint(product, 0)
  const rects = getLayer(project, layer).items.map((i) => placementRect(i, product))
  for (let y = h / 2; y + h / 2 <= pallet.width + 1e-6; y += h) {
    for (let x = w / 2; x + w / 2 <= pallet.length + 1e-6; x += w) {
      const r = { x1: x - w / 2, y1: y - h / 2, x2: x + w / 2, y2: y + h / 2 }
      if (rects.every((o) => overlapDepth(r, o) === 0)) return { x, y }
    }
  }
  return { x: pallet.length / 2, y: pallet.width / 2 }
}

function sanitizeUi(state: Pick<AppState, 'project' | 'activeLayer' | 'selection'>): Pick<AppState, 'activeLayer' | 'selection'> {
  const activeLayer: LayerName = state.activeLayer === 'B' && !state.project.layers.B ? 'A' : state.activeLayer
  const ids = new Set(getLayer(state.project, activeLayer).items.map((i) => i.id))
  const selection = state.selection.filter((id) => ids.has(id))
  return {
    activeLayer,
    selection: selection.length === state.selection.length ? state.selection : selection,
  }
}

export const useStore = create<AppState>((set, get) => {
  const autosave = loadAutosave()
  const initialProject = autosave?.project ?? createProject()

  const update: AppState['update'] = (recipe, options) => {
    set((state) => {
      const next = produce(state.project, (draft) => {
        recipe(draft)
        syncLinkedLayers(draft)
      })
      if (next === state.project) return state
      const now = Date.now()
      const coalesced =
        !!options?.coalesce && options.coalesce === lastCoalesceKey && now - lastCoalesceTime < COALESCE_MS && state.past.length > 0
      lastCoalesceKey = options?.coalesce ?? null
      lastCoalesceTime = now
      const keepHistory = options?.transient || coalesced
      const ui = sanitizeUi({ project: next, activeLayer: state.activeLayer, selection: state.selection })
      return {
        project: next,
        past: keepHistory ? state.past : [...state.past, state.project].slice(-HISTORY_LIMIT),
        future: options?.transient ? state.future : [],
        ...ui,
      }
    })
  }

  const editActive = (fn: (items: Placement[], project: Project) => Placement[], options?: UpdateOptions) => {
    const layer = get().activeLayer
    update((draft) => editLayer(draft, layer, (items) => fn(items, draft)), options)
  }

  return {
    project: initialProject,
    past: [],
    future: [],
    savedProject: autosave?.dirty ? null : initialProject,
    fileName: autosave?.fileName ?? null,
    restored: !!autosave,
    fileHandle: null,

    activeLayer: 'A',
    selection: [],
    view: 'layout',
    step: 'pallet',
    rightTab: 'selection',
    tool: 'select',
    orderCursor: 1,
    dialog: null,
    confirm: null,
    toasts: [],
    clipboard: [],
    fitRequest: 0,
    ...loadPrefs(),

    update,

    beginGesture: () => {
      gestureSnapshot = get().project
    },
    endGesture: () => {
      const snapshot = gestureSnapshot
      gestureSnapshot = null
      if (!snapshot) return
      set((state) =>
        state.project === snapshot ? state : { past: [...state.past, snapshot].slice(-HISTORY_LIMIT), future: [] },
      )
      lastCoalesceKey = null
    },

    undo: () =>
      set((state) => {
        const previous = state.past[state.past.length - 1]
        if (!previous) return state
        lastCoalesceKey = null
        return {
          project: previous,
          past: state.past.slice(0, -1),
          future: [state.project, ...state.future],
          ...sanitizeUi({ project: previous, activeLayer: state.activeLayer, selection: state.selection }),
        }
      }),
    redo: () =>
      set((state) => {
        const next = state.future[0]
        if (!next) return state
        lastCoalesceKey = null
        return {
          project: next,
          past: [...state.past, state.project],
          future: state.future.slice(1),
          ...sanitizeUi({ project: next, activeLayer: state.activeLayer, selection: state.selection }),
        }
      }),

    newProject: () => {
      const project = createProject()
      lastCoalesceKey = null
      set((state) => ({
        project,
        past: [],
        future: [],
        savedProject: project,
        fileName: null,
        fileHandle: null,
        activeLayer: 'A',
        selection: [],
        tool: 'select',
        step: 'pallet',
        view: 'layout',
        fitRequest: state.fitRequest + 1,
      }))
    },
    loadProject: (project, fileName = null, handle = null) => {
      lastCoalesceKey = null
      set((state) => ({
        project,
        past: [],
        future: [],
        savedProject: fileName ? project : null,
        fileName,
        fileHandle: handle,
        activeLayer: 'A',
        selection: [],
        tool: 'select',
        fitRequest: state.fitRequest + 1,
      }))
    },
    markSaved: (fileName, handle) => set((state) => ({ savedProject: state.project, fileName, fileHandle: handle })),

    setName: (name) => update((d) => void (d.name = name), { coalesce: 'name' }),
    setPallet: (patch) => {
      update((d) => void Object.assign(d.pallet, patch), { coalesce: 'pallet:' + Object.keys(patch).join(',') })
      if ('length' in patch || 'width' in patch) get().requestFit()
    },
    setProduct: (patch) => update((d) => void Object.assign(d.product, patch), { coalesce: 'product:' + Object.keys(patch).join(',') }),
    setRobot: (patch) =>
      update(
        (d) => {
          const wasSingle = d.robot.pickMode === 'pojedynczy'
          Object.assign(d.robot, patch)
          // Przy przejściu na chwyt podwójny nieaktualna konfiguracja cykli jest zastępowana parowaniem kolejnym.
          if (wasSingle && d.robot.pickMode === 'podwojny' && d.layers.A.items.length > 0) {
            const orders = d.layers.A.items.map((i) => i.order)
            if (parseCycles(d.robot.assignments, orders).errors.length) {
              d.robot.assignments = formatCycles(autoPairCycles(orders))
            }
          }
        },
        { coalesce: 'robot:' + Object.keys(patch).join(',') },
      ),
    setSlipSheet: (patch) => update((d) => void Object.assign(d.slipSheet, patch), { coalesce: 'slip:' + Object.keys(patch).join(',') }),

    setActiveLayer: (layer) =>
      set((state) => {
        if (layer === 'B' && !state.project.layers.B) return state
        return { activeLayer: layer, selection: [], tool: state.tool === 'order' ? 'select' : state.tool }
      }),
    createLayerB: (mode) => {
      update((d) => {
        d.layers.B =
          mode === 'rot180'
            ? { name: 'B', items: rotatedLayerB(d), link: 'rot180' }
            : { name: 'B', items: d.layers.A.items.map((i) => ({ ...i })), link: null }
      })
      set({ activeLayer: 'B', selection: [] })
    },
    removeLayerB: () => {
      set({ activeLayer: 'A', selection: [] })
      update((d) => void delete d.layers.B)
    },
    setLayerBLink: (linked) =>
      update((d) => {
        if (d.layers.B) d.layers.B.link = linked ? 'rot180' : null
      }),

    select: (ids) => set({ selection: ids }),
    toggleSelect: (id) =>
      set((state) => ({
        selection: state.selection.includes(id) ? state.selection.filter((x) => x !== id) : [...state.selection, id],
      })),
    selectAll: () => set((state) => ({ selection: getLayer(state.project, state.activeLayer).items.map((i) => i.id) })),

    addItem: (at) => {
      const { project, activeLayer } = get()
      if (!isLayerEditable(project, activeLayer)) return
      const spot = at ?? freeSpot(project, activeLayer)
      const id = nextId(getLayer(project, activeLayer).items)
      update((d) => {
        const existing = d.layers.A.items.map((i) => i.order)
        editLayer(d, activeLayer, (items) => [...items, { id, x: round3(spot.x), y: round3(spot.y), rotation: 0, order: items.length + 1 }])
        if (activeLayer === 'A' && d.robot.pickMode === 'podwojny') {
          d.robot.assignments = appendToCycles(d.robot.assignments, existing, existing.length + 1)
        }
      })
      set({ selection: [id] })
    },
    deleteSelected: () => {
      const { selection, activeLayer } = get()
      if (!selection.length) return
      update((d) => {
        editLayer(d, activeLayer, (items) => {
          const remaining = items.filter((i) => !selection.includes(i.id))
          const compacted = compactOrders(remaining)
          if (activeLayer === 'A') {
            const map = new Map(remaining.map((i) => [i.order, compacted.find((c) => c.id === i.id)!.order]))
            d.robot.assignments = remapAssignments(d.robot.assignments, map)
          }
          return compacted
        })
      })
      set({ selection: [] })
    },
    rotateSelected: (delta = 90) => {
      const { selection } = get()
      if (!selection.length) return
      editActive((items) => rotateItems(items, selection, delta))
    },
    duplicateSelected: () => {
      const { selection, project, activeLayer } = get()
      if (!selection.length || !isLayerEditable(project, activeLayer)) return
      const source = sortedByOrder(getLayer(project, activeLayer).items.filter((i) => selection.includes(i.id)))
      const bounds = rectsBounds(source.map((i) => placementRect(i, project.product)))
      if (!bounds) return
      // Kopia trafia obok zaznaczenia: w prawo, a gdy brak miejsca – poniżej.
      const bw = bounds.x2 - bounds.x1
      const bh = bounds.y2 - bounds.y1
      let dx = 25
      let dy = 25
      if (bounds.x2 + bw <= project.pallet.length + 1e-6) [dx, dy] = [bw, 0]
      else if (bounds.y2 + bh <= project.pallet.width + 1e-6) [dx, dy] = [0, bh]
      let id = nextId(getLayer(project, activeLayer).items)
      const created: number[] = []
      update((d) => {
        editLayer(d, activeLayer, (items) => {
          const out = [...items]
          for (const s of source) {
            created.push(id)
            const order = out.length + 1
            if (activeLayer === 'A' && d.robot.pickMode === 'podwojny') {
              d.robot.assignments = appendToCycles(d.robot.assignments, out.map((i) => i.order), order)
            }
            out.push({ id: id++, x: round3(s.x + dx), y: round3(s.y + dy), rotation: s.rotation, order })
          }
          return out
        })
      })
      set({ selection: created })
    },
    copySelected: () =>
      set((state) => ({
        clipboard: sortedByOrder(getLayer(state.project, state.activeLayer).items.filter((i) => state.selection.includes(i.id))),
      })),
    paste: () => {
      const { clipboard, project, activeLayer } = get()
      if (!clipboard.length || !isLayerEditable(project, activeLayer)) return
      let id = nextId(getLayer(project, activeLayer).items)
      const created: number[] = []
      update((d) => {
        editLayer(d, activeLayer, (items) => {
          const out = [...items]
          for (const c of clipboard) {
            created.push(id)
            const order = out.length + 1
            if (activeLayer === 'A' && d.robot.pickMode === 'podwojny') {
              d.robot.assignments = appendToCycles(d.robot.assignments, out.map((i) => i.order), order)
            }
            out.push({ id: id++, x: round3(c.x + 25), y: round3(c.y + 25), rotation: c.rotation, order })
          }
          return out
        })
      })
      set({ selection: created })
    },
    nudgeSelected: (dx, dy) => {
      const { selection } = get()
      if (!selection.length) return
      editActive(
        (items) => items.map((i) => (selection.includes(i.id) ? { ...i, x: round3(i.x + dx), y: round3(i.y + dy) } : i)),
        { coalesce: 'nudge' },
      )
    },
    moveItems: (positions, transient = false) =>
      editActive(
        (items) =>
          items.map((i) => {
            const p = positions.get(i.id)
            return p ? { ...i, x: round3(p.x), y: round3(p.y) } : i
          }),
        { transient },
      ),
    patchItem: (id, patch) =>
      editActive(
        (items) =>
          items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...(patch.x !== undefined ? { x: round3(patch.x) } : {}),
                  ...(patch.y !== undefined ? { y: round3(patch.y) } : {}),
                  ...(patch.rotation !== undefined ? { rotation: normalizeRotation(patch.rotation) as Rotation } : {}),
                }
              : i,
          ),
        { coalesce: `item:${id}:${Object.keys(patch).join(',')}` },
      ),
    setItemOrder: (id, order) => editActive((items) => moveOrder(items, id, order)),
    clickOrder: (id) => {
      const { orderCursor, project, activeLayer } = get()
      const count = getLayer(project, activeLayer).items.length
      editActive((items) => moveOrder(items, id, orderCursor), { coalesce: 'click-order' })
      const next = orderCursor + 1
      if (next > count) set({ tool: 'select', orderCursor: 1 })
      else set({ orderCursor: next })
    },
    applyAutoOrder: (strategy, corner) => editActive((items, project) => autoOrder(items, project.product, strategy, corner)),
    renumber: () => editActive((items) => compactOrders(items)),
    alignSelected: (mode) => {
      const { selection } = get()
      editActive((items, project) => alignItems(items, selection, project.product, mode))
    },
    centerLayer: () => editActive((items, project) => centerOnPallet(items, project.product, project.pallet)),
    clearLayer: () => {
      editActive(() => [])
      set({ selection: [] })
    },
    applyPattern: (items) => {
      update((d) => {
        d.layers.A.items = items.map((i) => ({ ...i }))
        if (d.layers.B && d.layers.B.link === null) {
          // Niezależna warstwa B po wygenerowaniu nowego układu A nie miałaby sensu – wraca do obrotu A.
          d.layers.B.link = 'rot180'
        }
        if (d.robot.pickMode === 'podwojny') d.robot.assignments = formatCycles(autoPairCycles(items.map((i) => i.order)))
      })
      set((state) => ({ activeLayer: 'A', selection: [], fitRequest: state.fitRequest + 1 }))
    },
    autoPair: () => update((d) => void (d.robot.assignments = formatCycles(autoPairCycles(d.layers.A.items.map((i) => i.order))))),

    setView: (view) => set({ view }),
    setStep: (step) => set({ step }),
    setRightTab: (rightTab) => set({ rightTab }),
    setTool: (tool) => set({ tool, orderCursor: 1 }),
    setPrefs: (patch) => set(patch),
    openDialog: (dialog) => set({ dialog }),
    askConfirm: (confirm) => set({ confirm }),
    toast: (message, kind = 'info') => {
      const id = ++toastSeq
      set((state) => ({ toasts: [...state.toasts.slice(-3), { id, kind, message }] }))
      setTimeout(() => get().dismissToast(id), kind === 'error' ? 7000 : 3500)
    },
    dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    requestFit: () => set((state) => ({ fitRequest: state.fitRequest + 1 })),
  }
})

/** Czy projekt ma niezapisane zmiany względem pliku. */
export function isDirty(state: Pick<AppState, 'project' | 'savedProject'>): boolean {
  return state.project !== state.savedProject
}

/** Przywraca stan początkowy (dla testów). */
export function resetStore(project: Project = createProject()) {
  lastCoalesceKey = null
  gestureSnapshot = null
  useStore.setState({
    project,
    past: [],
    future: [],
    savedProject: project,
    fileName: null,
    fileHandle: null,
    restored: false,
    activeLayer: 'A',
    selection: [],
    view: 'layout',
    step: 'pallet',
    rightTab: 'selection',
    tool: 'select',
    orderCursor: 1,
    dialog: null,
    confirm: null,
    toasts: [],
    clipboard: [],
  })
}
