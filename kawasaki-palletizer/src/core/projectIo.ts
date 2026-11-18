import { defaultPallet, defaultProduct, defaultRobot, defaultSlipSheet, PROJECT_FORMAT_VERSION } from './defaults'
import { axesValid, CORNERS, DIRECTIONS, normalizeRotation, ROTATIONS, rotationInBase } from './geometry'
import { isExactRotation, syncLinkedLayers } from './layers'
import type { Corner, Direction, Layer, LayerName, Placement, Project } from './types'

export class ProjectFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProjectFormatError'
  }
}

type Dict = Record<string, unknown>

const isDict = (v: unknown): v is Dict => typeof v === 'object' && v !== null && !Array.isArray(v)

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}

function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback
}

/** Odczyt pola zapisanego w camelCase (format 4) lub snake_case (format 3 z wersji 2.x). */
function field(d: Dict, camel: string): unknown {
  if (camel in d) return d[camel]
  const snake = camel.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
  return d[snake]
}

function readItems(raw: unknown): Placement[] {
  if (!Array.isArray(raw)) return []
  const items: Placement[] = []
  const used = new Set<number>()
  raw.forEach((entry, idx) => {
    if (!isDict(entry)) return
    let id = Math.round(num(entry.id, idx + 1))
    while (used.has(id) || id < 1) id++
    used.add(id)
    items.push({
      id,
      x: num(entry.x, 0),
      y: num(entry.y, 0),
      rotation: normalizeRotation(num(entry.rotation, 0)),
      order: Math.round(num(entry.order, idx + 1)),
    })
  })
  return items
}

function readLayer(raw: unknown, name: LayerName): Layer {
  const d = isDict(raw) ? raw : {}
  return { name, items: readItems(d.items), link: d.link === 'rot180' ? 'rot180' : null }
}

/**
 * Wczytuje projekt z obiektu JSON. Obsługuje format 4 (bieżący) oraz format 3 z Kawasaki Palletizer 2.x
 * (klucze snake_case, brak przekładek i trybu orientacji).
 */
export function parseProject(data: unknown): Project {
  if (!isDict(data)) throw new ProjectFormatError('Plik nie zawiera projektu Kawasaki Palletizer.')
  if (!isDict(data.pallet) || !isDict(data.product) || !isDict(data.layers)) {
    throw new ProjectFormatError('Plik nie zawiera projektu Kawasaki Palletizer (brak sekcji palety, produktu lub warstw).')
  }
  const version = num(data.version, 3)
  if (version > PROJECT_FORMAT_VERSION) {
    throw new ProjectFormatError(
      `Projekt zapisano w nowszej wersji programu (format ${version}). Zaktualizuj aplikację, aby go otworzyć.`,
    )
  }
  const legacy = version < 4

  const dp = defaultPallet()
  const pallet = data.pallet
  const dq = defaultProduct()
  const product = data.product
  const dr = defaultRobot()
  const robot = isDict(data.robot) ? data.robot : {}
  const ds = defaultSlipSheet()
  const slip = isDict(data.slipSheet) ? data.slipSheet : {}
  const layers = data.layers

  if (!isDict(layers.A)) throw new ProjectFormatError('Projekt nie zawiera warstwy A.')

  const height = Math.max(0.001, num(field(product, 'height'), dq.height))

  const project: Project = {
    version: PROJECT_FORMAT_VERSION,
    name: str(data.name, 'Projekt'),
    pallet: {
      length: Math.max(1, num(field(pallet, 'length'), dp.length)),
      width: Math.max(1, num(field(pallet, 'width'), dp.width)),
      baseCorner: pick<Corner>(field(pallet, 'baseCorner'), CORNERS, dp.baseCorner),
      xDirection: pick<Direction>(field(pallet, 'xDirection'), DIRECTIONS, dp.xDirection),
      yDirection: pick<Direction>(field(pallet, 'yDirection'), DIRECTIONS, dp.yDirection),
    },
    product: {
      kind: pick(field(product, 'kind'), ['worek', 'karton'] as const, dq.kind),
      length: Math.max(1, num(field(product, 'length'), dq.length)),
      width: Math.max(1, num(field(product, 'width'), dq.width)),
      height,
      layerIncrement: Math.max(0.001, num(field(product, 'layerIncrement'), height)),
      allowOverhang: bool(field(product, 'allowOverhang'), dq.allowOverhang),
      maxOverhang: Math.max(0, num(field(product, 'maxOverhang'), dq.maxOverhang)),
      allowOverlap: bool(field(product, 'allowOverlap'), dq.allowOverlap),
      maxOverlap: Math.max(0, num(field(product, 'maxOverlap'), dq.maxOverlap)),
    },
    layers: { A: readLayer(layers.A, 'A') },
    robot: {
      programName: str(field(robot, 'programName'), dr.programName),
      baseName: str(field(robot, 'baseName'), dr.baseName),
      pickup: str(field(robot, 'pickup'), dr.pickup),
      pickupApproach: str(field(robot, 'pickupApproach'), dr.pickupApproach),
      layers: Math.max(1, Math.round(num(field(robot, 'layers'), dr.layers))),
      firstZ: num(field(robot, 'firstZ'), dr.firstZ),
      safeZ: num(field(robot, 'safeZ'), dr.safeZ),
      speed: num(field(robot, 'speed'), dr.speed),
      accel: num(field(robot, 'accel'), dr.accel),
      decel: num(field(robot, 'decel'), dr.decel),
      pickMode: pick(field(robot, 'pickMode'), ['pojedynczy', 'podwojny'] as const, dr.pickMode),
      s1Name: str(field(robot, 's1Name'), dr.s1Name),
      s1On: str(field(robot, 's1On'), dr.s1On),
      s1Off: str(field(robot, 's1Off'), dr.s1Off),
      s2Name: str(field(robot, 's2Name'), dr.s2Name),
      s2On: str(field(robot, 's2On'), dr.s2On),
      s2Off: str(field(robot, 's2Off'), dr.s2Off),
      assignments: str(field(robot, 'assignments'), dr.assignments),
      gripWait: Math.max(0, num(field(robot, 'gripWait'), dr.gripWait)),
      releaseWait: Math.max(0, num(field(robot, 'releaseWait'), dr.releaseWait)),
      // Starsze projekty zachowują dotychczasowy sposób liczenia kąta O, aby kod AS się nie zmienił.
      orientationMode: pick(field(robot, 'orientationMode'), ['base', 'legacy'] as const, legacy ? 'legacy' : dr.orientationMode),
      oOffset: num(field(robot, 'oOffset'), 0),
    },
    slipSheet: {
      enabled: bool(slip.enabled, ds.enabled),
      thickness: Math.max(0, num(slip.thickness, ds.thickness)),
      every: Math.max(1, Math.round(num(slip.every, ds.every))),
      callProgram: str(slip.callProgram, ds.callProgram),
    },
  }

  if (legacy && !('orientationMode' in robot)) {
    // Gdy przeliczenie do BASE daje te same kąty co wersja 2.x, od razu używamy nowego trybu.
    const same = axesValid(project.pallet) && ROTATIONS.every((r) => rotationInBase(r, project.pallet) === r)
    project.robot.orientationMode = same ? 'base' : 'legacy'
  }

  if (isDict(layers.B)) {
    const b = readLayer(layers.B, 'B')
    project.layers.B = b
    if (legacy && isExactRotation(project)) b.link = 'rot180'
  }
  syncLinkedLayers(project)
  return project
}

export function parseProjectJson(text: string): Project {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new ProjectFormatError('Plik nie jest poprawnym dokumentem JSON.')
  }
  return parseProject(data)
}

export function serializeProject(project: Project): string {
  const out = {
    app: 'kawasaki-palletizer',
    version: PROJECT_FORMAT_VERSION,
    name: project.name,
    pallet: project.pallet,
    product: project.product,
    layers: project.layers,
    robot: project.robot,
    slipSheet: project.slipSheet,
  }
  return JSON.stringify(out, null, 2) + '\n'
}

export function suggestedFileName(project: Pick<Project, 'name'>, extension: string): string {
  const base = project.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `${base || 'projekt'}.${extension}`
}
