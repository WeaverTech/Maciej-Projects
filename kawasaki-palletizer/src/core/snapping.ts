import type { Pallet, Point, Rect } from './types'

export interface Guide {
  axis: 'x' | 'y'
  /** Położenie linii pomocniczej na osi [mm]. */
  pos: number
  /** Zakres linii na osi prostopadłej [mm]. */
  from: number
  to: number
}

export interface SnapOptions {
  enabled: boolean
  /** Promień przyciągania do krawędzi i środków [mm]. */
  tolerance: number
  grid: boolean
  gridStep: number
}

export interface SnapResult {
  dx: number
  dy: number
  guides: Guide[]
}

interface Candidate {
  delta: number
  pos: number
  from: number
  to: number
  /** Niższa wartość = wyższy priorytet przy równej odległości. */
  rank: number
}

function best(candidates: Candidate[], tolerance: number): Candidate | null {
  let winner: Candidate | null = null
  for (const c of candidates) {
    if (Math.abs(c.delta) > tolerance) continue
    if (
      !winner ||
      Math.abs(c.delta) < Math.abs(winner.delta) - 1e-9 ||
      (Math.abs(Math.abs(c.delta) - Math.abs(winner.delta)) <= 1e-9 && c.rank < winner.rank)
    ) {
      winner = c
    }
  }
  return winner
}

/**
 * Przyciąganie przesuwanego obrysu (prostokąt obejmujący zaznaczenie) do krawędzi palety,
 * krawędzi i środków innych produktów, osi palety, a w ostatniej kolejności do siatki.
 *
 * @param moving obrys zaznaczenia w proponowanym położeniu
 * @param others obrysy pozostałych produktów warstwy
 */
export function snapMove(moving: Rect, others: Rect[], pallet: Pallet, options: SnapOptions): SnapResult {
  if (!options.enabled) return { dx: 0, dy: 0, guides: [] }
  const tol = options.tolerance
  const mw = moving.x2 - moving.x1
  const mh = moving.y2 - moving.y1
  const mcx = (moving.x1 + moving.x2) / 2
  const mcy = (moving.y1 + moving.y2) / 2

  const xs: Candidate[] = []
  const ys: Candidate[] = []

  // Krawędzie i osie palety.
  xs.push({ delta: 0 - moving.x1, pos: 0, from: 0, to: pallet.width, rank: 0 })
  xs.push({ delta: pallet.length - moving.x2, pos: pallet.length, from: 0, to: pallet.width, rank: 0 })
  xs.push({ delta: pallet.length / 2 - mcx, pos: pallet.length / 2, from: 0, to: pallet.width, rank: 3 })
  ys.push({ delta: 0 - moving.y1, pos: 0, from: 0, to: pallet.length, rank: 0 })
  ys.push({ delta: pallet.width - moving.y2, pos: pallet.width, from: 0, to: pallet.length, rank: 0 })
  ys.push({ delta: pallet.width / 2 - mcy, pos: pallet.width / 2, from: 0, to: pallet.length, rank: 3 })

  for (const o of others) {
    const ocx = (o.x1 + o.x2) / 2
    const ocy = (o.y1 + o.y2) / 2
    // Sąsiedztwo w pionie/poziomie ma sens tylko dla produktów leżących blisko na osi prostopadłej.
    const nearY = moving.y1 <= o.y2 + tol + mh && moving.y2 >= o.y1 - tol - mh
    const nearX = moving.x1 <= o.x2 + tol + mw && moving.x2 >= o.x1 - tol - mw
    if (nearY) {
      const from = Math.min(o.y1, moving.y1)
      const to = Math.max(o.y2, moving.y2)
      xs.push({ delta: o.x2 - moving.x1, pos: o.x2, from, to, rank: 1 }) // styk: lewa do prawej
      xs.push({ delta: o.x1 - moving.x2, pos: o.x1, from, to, rank: 1 }) // styk: prawa do lewej
      xs.push({ delta: o.x1 - moving.x1, pos: o.x1, from, to, rank: 2 }) // wyrównanie lewych
      xs.push({ delta: o.x2 - moving.x2, pos: o.x2, from, to, rank: 2 }) // wyrównanie prawych
      xs.push({ delta: ocx - mcx, pos: ocx, from, to, rank: 4 })
    }
    if (nearX) {
      const from = Math.min(o.x1, moving.x1)
      const to = Math.max(o.x2, moving.x2)
      ys.push({ delta: o.y2 - moving.y1, pos: o.y2, from, to, rank: 1 })
      ys.push({ delta: o.y1 - moving.y2, pos: o.y1, from, to, rank: 1 })
      ys.push({ delta: o.y1 - moving.y1, pos: o.y1, from, to, rank: 2 })
      ys.push({ delta: o.y2 - moving.y2, pos: o.y2, from, to, rank: 2 })
      ys.push({ delta: ocy - mcy, pos: ocy, from, to, rank: 4 })
    }
  }

  const guides: Guide[] = []
  let dx = 0
  let dy = 0

  const bx = best(xs, tol)
  if (bx) {
    dx = bx.delta
    guides.push({ axis: 'x', pos: bx.pos, from: bx.from, to: bx.to })
  } else if (options.grid && options.gridStep > 0) {
    dx = Math.round(moving.x1 / options.gridStep) * options.gridStep - moving.x1
  }
  const by = best(ys, tol)
  if (by) {
    dy = by.delta
    guides.push({ axis: 'y', pos: by.pos, from: by.from, to: by.to })
  } else if (options.grid && options.gridStep > 0) {
    dy = Math.round(moving.y1 / options.gridStep) * options.gridStep - moving.y1
  }
  return { dx, dy, guides }
}

/** Przyciąganie punktu miarki do narożników palety oraz środków i narożników produktów. */
export function snapMeasurePoint(point: Point, rects: Rect[], pallet: Pallet, tolerance: number): { point: Point; snapped: boolean } {
  const candidates: Point[] = [
    { x: 0, y: 0 },
    { x: pallet.length, y: 0 },
    { x: pallet.length, y: pallet.width },
    { x: 0, y: pallet.width },
    { x: pallet.length / 2, y: pallet.width / 2 },
  ]
  for (const r of rects) {
    candidates.push(
      { x: (r.x1 + r.x2) / 2, y: (r.y1 + r.y2) / 2 },
      { x: r.x1, y: r.y1 },
      { x: r.x2, y: r.y1 },
      { x: r.x2, y: r.y2 },
      { x: r.x1, y: r.y2 },
      { x: (r.x1 + r.x2) / 2, y: r.y1 },
      { x: (r.x1 + r.x2) / 2, y: r.y2 },
      { x: r.x1, y: (r.y1 + r.y2) / 2 },
      { x: r.x2, y: (r.y1 + r.y2) / 2 },
    )
  }
  let bestPoint: Point | null = null
  let bestDist = Infinity
  for (const c of candidates) {
    const d = Math.hypot(c.x - point.x, c.y - point.y)
    if (d < bestDist) {
      bestDist = d
      bestPoint = c
    }
  }
  if (bestPoint && bestDist <= tolerance) return { point: bestPoint, snapped: true }
  return { point, snapped: false }
}
