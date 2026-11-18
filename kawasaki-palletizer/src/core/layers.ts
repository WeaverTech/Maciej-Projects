import { EPS, footprint, normalizeRotation, placementRect, rectsBounds, round3 } from './geometry'
import type { Corner, Layer, LayerName, Pallet, Placement, Product, Project, Rotation } from './types'

/** Obrót pojedynczej pozycji o 180° względem środka palety. */
export function rotate180(item: Placement, pallet: Pallet): Placement {
  return {
    id: item.id,
    x: round3(pallet.length - item.x),
    y: round3(pallet.width - item.y),
    rotation: normalizeRotation(item.rotation + 180),
    order: item.order,
  }
}

/** Warstwa B jako obrót warstwy A o 180° względem środka palety. */
export function rotatedLayerB(project: Pick<Project, 'layers' | 'pallet'>): Placement[] {
  return project.layers.A.items.map((i) => rotate180(i, project.pallet))
}

/** Przelicza warstwę B, jeśli jest powiązana z A. Mutuje przekazany projekt (do użycia w immer). */
export function syncLinkedLayers(project: Project): void {
  const b = project.layers.B
  if (b && b.link === 'rot180') b.items = rotatedLayerB(project)
}

export function layerNames(project: Pick<Project, 'layers'>): LayerName[] {
  return project.layers.B ? ['A', 'B'] : ['A']
}

export function getLayer(project: Pick<Project, 'layers'>, name: LayerName): Layer {
  return (name === 'B' ? project.layers.B : project.layers.A) ?? project.layers.A
}

/** Szablon używany przez warstwę nr `index` (1..n) – naprzemiennie A/B. */
export function templateForLayer(project: Pick<Project, 'layers'>, index: number): LayerName {
  return project.layers.B && index % 2 === 0 ? 'B' : 'A'
}

export function layerSequence(project: Pick<Project, 'layers' | 'robot'>): LayerName[] {
  const n = Math.max(1, Math.floor(project.robot.layers))
  return Array.from({ length: n }, (_, i) => templateForLayer(project, i + 1))
}

export function sortedByOrder(items: Placement[]): Placement[] {
  return [...items].sort((a, b) => a.order - b.order || a.id - b.id)
}

export function nextId(items: Placement[]): number {
  return items.reduce((m, i) => Math.max(m, i.id), 0) + 1
}

/** Nadaje numery 1..n z zachowaniem dotychczasowej względnej kolejności. */
export function compactOrders(items: Placement[]): Placement[] {
  const ranked = sortedByOrder(items)
  const rank = new Map(ranked.map((it, idx) => [it.id, idx + 1]))
  return items.map((it) => ({ ...it, order: rank.get(it.id) ?? it.order }))
}

/** Przenosi produkt na pozycję `newOrder`, przesuwając pozostałe. */
export function moveOrder(items: Placement[], id: number, newOrder: number): Placement[] {
  const ranked = sortedByOrder(items)
  const from = ranked.findIndex((i) => i.id === id)
  if (from < 0) return items
  const target = Math.min(Math.max(1, Math.round(newOrder)), ranked.length) - 1
  const [moved] = ranked.splice(from, 1)
  ranked.splice(target, 0, moved)
  const rank = new Map(ranked.map((it, idx) => [it.id, idx + 1]))
  return items.map((it) => ({ ...it, order: rank.get(it.id) ?? it.order }))
}

export type OrderStrategy = 'rows' | 'columns' | 'snake-rows' | 'snake-columns'

export const ORDER_STRATEGY_LABELS: Record<OrderStrategy, string> = {
  rows: 'Rzędami',
  columns: 'Kolumnami',
  'snake-rows': 'Wężykiem (rzędy)',
  'snake-columns': 'Wężykiem (kolumny)',
}

/**
 * Automatyczna numeracja produktów od wybranego narożnika palety.
 * Produkty są grupowane w pasy (rzędy lub kolumny) z tolerancją połowy mniejszego wymiaru produktu.
 */
export function autoOrder(
  items: Placement[],
  product: Pick<Product, 'length' | 'width'>,
  strategy: OrderStrategy,
  start: Corner = 'A',
): Placement[] {
  if (items.length === 0) return items
  const byRows = strategy === 'rows' || strategy === 'snake-rows'
  const snake = strategy === 'snake-rows' || strategy === 'snake-columns'
  const fromRight = start === 'B' || start === 'C'
  const fromBottom = start === 'C' || start === 'D'
  const tol = Math.max(1, Math.min(product.length, product.width) / 2)

  const primary = (i: Placement) => (byRows ? (fromBottom ? -i.y : i.y) : fromRight ? -i.x : i.x)
  const secondary = (i: Placement) => (byRows ? (fromRight ? -i.x : i.x) : fromBottom ? -i.y : i.y)

  const sorted = [...items].sort((a, b) => primary(a) - primary(b) || secondary(a) - secondary(b))
  const bands: Placement[][] = []
  let bandStart = Number.NEGATIVE_INFINITY
  for (const it of sorted) {
    const p = primary(it)
    if (bands.length === 0 || p - bandStart > tol) {
      bands.push([it])
      bandStart = p
    } else {
      bands[bands.length - 1].push(it)
    }
  }
  const ordered: Placement[] = []
  bands.forEach((band, idx) => {
    band.sort((a, b) => secondary(a) - secondary(b) || a.id - b.id)
    if (snake && idx % 2 === 1) band.reverse()
    ordered.push(...band)
  })
  const rank = new Map(ordered.map((it, idx) => [it.id, idx + 1]))
  return items.map((it) => ({ ...it, order: rank.get(it.id) ?? it.order }))
}

/** Przesunięcie wszystkich produktów tak, aby obrys układu był wyśrodkowany na palecie. */
export function centerOnPallet(items: Placement[], product: Product, pallet: Pallet): Placement[] {
  const b = rectsBounds(items.map((i) => placementRect(i, product)))
  if (!b) return items
  const dx = pallet.length / 2 - (b.x1 + b.x2) / 2
  const dy = pallet.width / 2 - (b.y1 + b.y2) / 2
  if (Math.abs(dx) < EPS && Math.abs(dy) < EPS) return items
  return items.map((i) => ({ ...i, x: round3(i.x + dx), y: round3(i.y + dy) }))
}

export type AlignMode = 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom'

export function alignItems(items: Placement[], ids: number[], product: Product, mode: AlignMode): Placement[] {
  const sel = items.filter((i) => ids.includes(i.id))
  const b = rectsBounds(sel.map((i) => placementRect(i, product)))
  if (!b || sel.length < 2) return items
  return items.map((i) => {
    if (!ids.includes(i.id)) return i
    const [w, h] = footprint(product, i.rotation)
    switch (mode) {
      case 'left':
        return { ...i, x: round3(b.x1 + w / 2) }
      case 'right':
        return { ...i, x: round3(b.x2 - w / 2) }
      case 'center-x':
        return { ...i, x: round3((b.x1 + b.x2) / 2) }
      case 'top':
        return { ...i, y: round3(b.y1 + h / 2) }
      case 'bottom':
        return { ...i, y: round3(b.y2 - h / 2) }
      case 'center-y':
        return { ...i, y: round3((b.y1 + b.y2) / 2) }
    }
  })
}

/** Obrót zaznaczonych produktów o `delta` stopni wokół ich własnych środków. */
export function rotateItems(items: Placement[], ids: number[], delta: number): Placement[] {
  return items.map((i) => (ids.includes(i.id) ? { ...i, rotation: normalizeRotation(i.rotation + delta) } : i))
}

export interface ComparisonResult {
  severity: 'error' | 'warning' | 'info'
  message: string
  order?: number
}

/** Porównanie warstwy B z obrotem warstwy A o 180°. */
export function compareAB(project: Pick<Project, 'layers' | 'pallet'>): ComparisonResult[] {
  const b = project.layers.B
  if (!b) return [{ severity: 'error', message: 'Brak warstwy B' }]
  const A = new Map(project.layers.A.items.map((i) => [i.order, i]))
  const B = new Map(b.items.map((i) => [i.order, i]))
  const out: ComparisonResult[] = []
  const orders = [...new Set([...A.keys(), ...B.keys()])].sort((x, y) => x - y)
  for (const n of orders) {
    const a = A.get(n)
    const bb = B.get(n)
    if (!a || !bb) {
      out.push({ severity: 'error', message: `Produkt ${n} nie występuje w obu warstwach`, order: n })
      continue
    }
    if (Math.abs(bb.x - (project.pallet.length - a.x)) > 1e-3 || Math.abs(bb.y - (project.pallet.width - a.y)) > 1e-3) {
      out.push({ severity: 'warning', message: `Produkt ${n}: pozycja B różni się od obrotu 180°`, order: n })
    }
    if (bb.rotation % 360 !== (a.rotation + 180) % 360) {
      out.push({ severity: 'warning', message: `Produkt ${n}: niezgodny obrót`, order: n })
    }
  }
  return out.length ? out : [{ severity: 'info', message: 'Warstwy A/B są zgodne' }]
}

/** Czy warstwa B jest dokładnym obrotem A o 180° (używane przy imporcie starszych plików). */
export function isExactRotation(project: Pick<Project, 'layers' | 'pallet'>): boolean {
  const b = project.layers.B
  if (!b || b.items.length !== project.layers.A.items.length) return false
  const res = compareAB(project)
  return res.length === 1 && res[0].severity === 'info'
}

export function makePlacement(id: number, x: number, y: number, rotation: Rotation, order: number): Placement {
  return { id, x: round3(x), y: round3(y), rotation, order }
}
