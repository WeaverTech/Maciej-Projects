import type { Corner, Direction, Pallet, Placement, Point, Product, Project, Rect, Rotation } from './types'

/** Tolerancja porównań geometrii [mm]. Nigdy nie porównuj `value > 0` bez EPS. */
export const EPS = 1e-6

/** Wektory kierunków w układzie planszy (+x w prawo, +y w dół). */
export const VECTORS: Record<Direction, readonly [number, number]> = {
  prawo: [1, 0],
  lewo: [-1, 0],
  dol: [0, 1],
  gora: [0, -1],
}

export const DIRECTIONS: Direction[] = ['prawo', 'lewo', 'gora', 'dol']
export const CORNERS: Corner[] = ['A', 'B', 'C', 'D']
export const ROTATIONS: Rotation[] = [0, 90, 180, 270]

export const DIRECTION_LABELS: Record<Direction, string> = {
  prawo: 'w prawo',
  lewo: 'w lewo',
  gora: 'w górę',
  dol: 'w dół',
}

export const CORNER_LABELS: Record<Corner, string> = {
  A: 'lewy górny',
  B: 'prawy górny',
  C: 'prawy dolny',
  D: 'lewy dolny',
}

export function cornerPoint(pallet: Pallet, corner: Corner): Point {
  switch (corner) {
    case 'A':
      return { x: 0, y: 0 }
    case 'B':
      return { x: pallet.length, y: 0 }
    case 'C':
      return { x: pallet.length, y: pallet.width }
    case 'D':
      return { x: 0, y: pallet.width }
  }
}

/** Położenie BASE na planszy. */
export function origin(pallet: Pallet): Point {
  return cornerPoint(pallet, pallet.baseCorner)
}

export function axesValid(pallet: Pallet): boolean {
  const vx = VECTORS[pallet.xDirection]
  const vy = VECTORS[pallet.yDirection]
  if (!vx || !vy) return false
  return vx[0] * vy[0] + vx[1] * vy[1] === 0
}

/** Kierunki +Y prostopadłe do zadanego +X. */
export function perpendicularDirections(x: Direction): Direction[] {
  return x === 'prawo' || x === 'lewo' ? ['gora', 'dol'] : ['prawo', 'lewo']
}

/**
 * Zwrot osi +Z prawoskrętnego układu BASE patrząc z góry na paletę.
 * `up` – od palety w górę, `down` – w głąb palety.
 */
export function zAxisDirection(pallet: Pallet): 'up' | 'down' | null {
  if (!axesValid(pallet)) return null
  const vx = VECTORS[pallet.xDirection]
  const vy = VECTORS[pallet.yDirection]
  // Iloczyn wektorowy w układzie ekranu (y w dół): wartość ujemna = obrót przeciwny do zegara = Z do obserwatora.
  const cross = vx[0] * vy[1] - vx[1] * vy[0]
  return cross < 0 ? 'up' : 'down'
}

/** Plansza → BASE. */
export function toBase(x: number, y: number, pallet: Pallet): Point {
  const o = origin(pallet)
  const vx = VECTORS[pallet.xDirection]
  const vy = VECTORS[pallet.yDirection]
  const dx = x - o.x
  const dy = y - o.y
  return { x: cleanZero(dx * vx[0] + dy * vx[1]), y: cleanZero(dx * vy[0] + dy * vy[1]) }
}

/** BASE → plansza (odwrotność `toBase`, wymaga prostopadłych osi). */
export function fromBase(bx: number, by: number, pallet: Pallet): Point {
  const o = origin(pallet)
  const vx = VECTORS[pallet.xDirection]
  const vy = VECTORS[pallet.yDirection]
  return { x: cleanZero(o.x + bx * vx[0] + by * vy[0]), y: cleanZero(o.y + bx * vx[1] + by * vy[1]) }
}

function cleanZero(v: number): number {
  return Object.is(v, -0) || Math.abs(v) < 1e-9 ? 0 : v
}

export function normalizeAngle(deg: number): number {
  let a = deg % 360
  if (a < 0) a += 360
  if (Math.abs(a - 360) < 1e-9 || Math.abs(a) < 1e-9) a = 0
  return a
}

export function normalizeRotation(deg: number): Rotation {
  const a = Math.round(normalizeAngle(deg) / 90) * 90
  return (a % 360) as Rotation
}

/**
 * Kąt osi długości produktu w układzie BASE [0..360).
 * Obrót na planszy jest liczony przeciwnie do zegara patrząc z góry, więc dla domyślnego
 * układu (BASE w D, +X w prawo, +Y w górę) kąt BASE jest równy obrotowi na planszy.
 */
export function rotationInBase(rotation: number, pallet: Pallet): number {
  const r = (rotation * Math.PI) / 180
  // Wektor osi długości w układzie planszy (y w dół).
  const ux = Math.cos(r)
  const uy = -Math.sin(r)
  const vx = VECTORS[pallet.xDirection]
  const vy = VECTORS[pallet.yDirection]
  const ax = ux * vx[0] + uy * vx[1]
  const ay = ux * vy[0] + uy * vy[1]
  const deg = (Math.atan2(ay, ax) * 180) / Math.PI
  return normalizeAngle(Math.round(deg * 1e6) / 1e6)
}

/** Kąt O wstawiany do TRANS(...) dla danego obrotu produktu. */
export function orientationO(rotation: number, project: Pick<Project, 'pallet' | 'robot'>): number {
  const base = project.robot.orientationMode === 'legacy' ? rotation : rotationInBase(rotation, project.pallet)
  return normalizeAngle(base + (project.robot.oOffset || 0))
}

/** Obrys produktu [dx, dy] na planszy dla danego obrotu. */
export function footprint(product: Pick<Product, 'length' | 'width'>, rotation: number): [number, number] {
  return normalizeAngle(rotation) % 180 === 90 ? [product.width, product.length] : [product.length, product.width]
}

export function placementRect(item: Pick<Placement, 'x' | 'y' | 'rotation'>, product: Pick<Product, 'length' | 'width'>): Rect {
  const [w, h] = footprint(product, item.rotation)
  return { x1: item.x - w / 2, y1: item.y - h / 2, x2: item.x + w / 2, y2: item.y + h / 2 }
}

export function rectsBounds(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null
  let x1 = Infinity
  let y1 = Infinity
  let x2 = -Infinity
  let y2 = -Infinity
  for (const r of rects) {
    x1 = Math.min(x1, r.x1)
    y1 = Math.min(y1, r.y1)
    x2 = Math.max(x2, r.x2)
    y2 = Math.max(y2, r.y2)
  }
  return { x1, y1, x2, y2 }
}

/** Największe wysunięcie obrysu poza paletę [mm] (0, gdy mieści się w całości). */
export function overhang(rect: Rect, pallet: Pallet): number {
  return Math.max(0, -rect.x1, rect.x2 - pallet.length, -rect.y1, rect.y2 - pallet.width)
}

/** Głębokość nakładania dwóch obrysów [mm] (mniejszy z wymiarów części wspólnej) albo 0. */
export function overlapDepth(a: Rect, b: Rect): number {
  const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)
  const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1)
  return ox > EPS && oy > EPS ? Math.min(ox, oy) : 0
}

export function rectArea(r: Rect): number {
  return Math.max(0, r.x2 - r.x1) * Math.max(0, r.y2 - r.y1)
}

export function pointInRect(p: Point, r: Rect): boolean {
  return p.x >= r.x1 && p.x <= r.x2 && p.y >= r.y1 && p.y <= r.y2
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1
}

export function round3(v: number): number {
  const r = Math.round(v * 1000) / 1000
  return Object.is(r, -0) ? 0 : r
}
