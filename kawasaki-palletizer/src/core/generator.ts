import { footprint, overlapDepth, placementRect, rectsBounds, round3 } from './geometry'
import { autoOrder, type OrderStrategy } from './layers'
import type { Corner, Pallet, Placement, Product, Rotation } from './types'

export interface GeneratorOptions {
  /** Odstęp między produktami [mm]. */
  gap: number
  /** Dopuszczalne wystawanie układu poza paletę z każdej strony [mm]. */
  overhang: number
  /** Ograniczenie liczby produktów (0 = bez limitu). */
  maxCount: number
  order: OrderStrategy
  startCorner: Corner
}

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  gap: 0,
  overhang: 0,
  maxCount: 0,
  order: 'rows',
  startCorner: 'A',
}

export type PatternKind = 'grid-0' | 'grid-90' | 'split-x' | 'split-y' | 'pinwheel'

export interface PatternCandidate {
  id: string
  kind: PatternKind
  name: string
  description: string
  items: Placement[]
  count: number
  /** Udział powierzchni palety zajętej przez produkty (0..1, bez części wystającej). */
  fill: number
  /** Liczba produktów obróconych o 90°. */
  rotated: number
}

interface Slot {
  x: number
  y: number
  w: number
  h: number
  rotation: Rotation
}

function block(x0: number, y0: number, cols: number, rows: number, w: number, h: number, gap: number, rotation: Rotation): Slot[] {
  const out: Slot[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({ x: x0 + c * (w + gap), y: y0 + r * (h + gap), w, h, rotation })
    }
  }
  return out
}

const fit = (space: number, size: number, gap: number) => (size <= 0 ? 0 : Math.max(0, Math.floor((space + gap + 1e-6) / (size + gap))))

const span = (count: number, size: number, gap: number) => (count <= 0 ? 0 : count * size + (count - 1) * gap)

function slotsValid(slots: Slot[], areaL: number, areaW: number): boolean {
  for (const s of slots) {
    if (s.x < -1e-6 || s.y < -1e-6 || s.x + s.w > areaL + 1e-6 || s.y + s.h > areaW + 1e-6) return false
  }
  for (let a = 0; a < slots.length; a++) {
    for (let b = a + 1; b < slots.length; b++) {
      const ra = { x1: slots[a].x, y1: slots[a].y, x2: slots[a].x + slots[a].w, y2: slots[a].y + slots[a].h }
      const rb = { x1: slots[b].x, y1: slots[b].y, x2: slots[b].x + slots[b].w, y2: slots[b].y + slots[b].h }
      if (overlapDepth(ra, rb) > 1e-6) return false
    }
  }
  return true
}

function finalize(
  kind: PatternKind,
  name: string,
  description: string,
  slots: Slot[],
  pallet: Pallet,
  product: Product,
  options: GeneratorOptions,
): PatternCandidate | null {
  if (slots.length === 0) return null
  // Wyśrodkowanie obrysu układu na palecie.
  const minX = Math.min(...slots.map((s) => s.x))
  const minY = Math.min(...slots.map((s) => s.y))
  const maxX = Math.max(...slots.map((s) => s.x + s.w))
  const maxY = Math.max(...slots.map((s) => s.y + s.h))
  const dx = pallet.length / 2 - (minX + maxX) / 2
  const dy = pallet.width / 2 - (minY + maxY) / 2
  let items: Placement[] = slots.map((s, idx) => ({
    id: idx + 1,
    x: round3(s.x + s.w / 2 + dx),
    y: round3(s.y + s.h / 2 + dy),
    rotation: s.rotation,
    order: idx + 1,
  }))
  items = autoOrder(items, product, options.order, options.startCorner)
  if (options.maxCount > 0 && items.length > options.maxCount) {
    items = items.filter((i) => i.order <= options.maxCount)
  }
  items = [...items].sort((a, b) => a.order - b.order).map((i, idx) => ({ ...i, id: idx + 1, order: idx + 1 }))

  const palletRect = { x1: 0, y1: 0, x2: pallet.length, y2: pallet.width }
  let covered = 0
  for (const it of items) {
    const r = placementRect(it, product)
    const w = Math.max(0, Math.min(r.x2, palletRect.x2) - Math.max(r.x1, palletRect.x1))
    const h = Math.max(0, Math.min(r.y2, palletRect.y2) - Math.max(r.y1, palletRect.y1))
    covered += w * h
  }
  const signature = items
    .map((i) => `${Math.round(i.x)}:${Math.round(i.y)}:${i.rotation % 180}`)
    .sort()
    .join('|')
  return {
    id: signature,
    kind,
    name,
    description,
    items,
    count: items.length,
    fill: Math.min(1, covered / (pallet.length * pallet.width)),
    rotated: items.filter((i) => i.rotation % 180 === 90).length,
  }
}

/**
 * Generuje kandydatów układu warstwy: siatki 0°/90°, układy dzielone (dwa bloki o różnej orientacji)
 * oraz układ wiatraczkowy. Kandydaci są posortowani od największej liczby produktów.
 */
export function generatePatterns(pallet: Pallet, product: Product, opts: Partial<GeneratorOptions> = {}): PatternCandidate[] {
  const options: GeneratorOptions = { ...DEFAULT_GENERATOR_OPTIONS, ...opts }
  const gap = Math.max(0, options.gap)
  const oh = Math.max(0, options.overhang)
  const L = pallet.length + 2 * oh
  const W = pallet.width + 2 * oh
  const [l0, w0] = footprint(product, 0)
  const [l90, w90] = footprint(product, 90)
  const candidates: (PatternCandidate | null)[] = []

  const grid = (rotation: Rotation, kind: PatternKind, name: string) => {
    const [w, h] = rotation === 0 ? [l0, w0] : [l90, w90]
    const cols = fit(L, w, gap)
    const rows = fit(W, h, gap)
    if (cols * rows === 0) return
    candidates.push(
      finalize(kind, name, `${cols} × ${rows}, wszystkie produkty ${rotation}°`, block(0, 0, cols, rows, w, h, gap, rotation), pallet, product, options),
    )
  }
  grid(0, 'grid-0', 'Siatka 0°')
  if (Math.abs(product.length - product.width) > 1e-6) grid(90, 'grid-90', 'Siatka 90°')

  if (Math.abs(product.length - product.width) > 1e-6) {
    // Podział wzdłuż długości palety: blok 0° z lewej, blok 90° z prawej (i odwrotnie).
    const splitX = (first: Rotation) => {
      const [fw, fh] = first === 0 ? [l0, w0] : [l90, w90]
      const [sw, sh] = first === 0 ? [l90, w90] : [l0, w0]
      const second: Rotation = first === 0 ? 90 : 0
      let best: Slot[] = []
      const maxCols = fit(L, fw, gap)
      for (let c = 1; c < maxCols; c++) {
        const used = span(c, fw, gap) + gap
        const cols2 = fit(L - used, sw, gap)
        if (cols2 === 0) continue
        const rows1 = fit(W, fh, gap)
        const rows2 = fit(W, sh, gap)
        if (rows1 === 0 || rows2 === 0) continue
        const h1 = span(rows1, fh, gap)
        const h2 = span(rows2, sh, gap)
        const hMax = Math.max(h1, h2)
        const slots = [
          ...block(0, (hMax - h1) / 2, c, rows1, fw, fh, gap, first),
          ...block(used, (hMax - h2) / 2, cols2, rows2, sw, sh, gap, second),
        ]
        if (slots.length > best.length) best = slots
      }
      if (best.length) {
        candidates.push(
          finalize('split-x', 'Dzielony wzdłuż', `Dwa bloki obok siebie: ${first}° i ${second}°`, best, pallet, product, options),
        )
      }
    }
    const splitY = (first: Rotation) => {
      const [fw, fh] = first === 0 ? [l0, w0] : [l90, w90]
      const [sw, sh] = first === 0 ? [l90, w90] : [l0, w0]
      const second: Rotation = first === 0 ? 90 : 0
      let best: Slot[] = []
      const maxRows = fit(W, fh, gap)
      for (let r = 1; r < maxRows; r++) {
        const used = span(r, fh, gap) + gap
        const rows2 = fit(W - used, sh, gap)
        if (rows2 === 0) continue
        const cols1 = fit(L, fw, gap)
        const cols2 = fit(L, sw, gap)
        if (cols1 === 0 || cols2 === 0) continue
        const w1 = span(cols1, fw, gap)
        const w2 = span(cols2, sw, gap)
        const wMax = Math.max(w1, w2)
        const slots = [
          ...block((wMax - w1) / 2, 0, cols1, r, fw, fh, gap, first),
          ...block((wMax - w2) / 2, used, cols2, rows2, sw, sh, gap, second),
        ]
        if (slots.length > best.length) best = slots
      }
      if (best.length) {
        candidates.push(
          finalize('split-y', 'Dzielony w poprzek', `Dwa pasy jeden nad drugim: ${first}° i ${second}°`, best, pallet, product, options),
        )
      }
    }
    splitX(0)
    splitX(90)
    splitY(0)
    splitY(90)

    // Wiatraczek: bloki 0° w narożnikach A i C, bloki 90° w narożnikach B i D.
    let bestPin: Slot[] = []
    const maxA = Math.min(6, fit(L, l0, gap))
    const maxB = Math.min(6, fit(W, w0, gap))
    const maxC = Math.min(6, fit(L, l90, gap))
    const maxD = Math.min(6, fit(W, w90, gap))
    for (let a = 1; a <= maxA; a++) {
      for (let b = 1; b <= maxB; b++) {
        for (let c = 1; c <= maxC; c++) {
          for (let d = 1; d <= maxD; d++) {
            const count = 2 * (a * b + c * d)
            if (count <= bestPin.length) continue
            const bw0 = span(a, l0, gap)
            const bh0 = span(b, w0, gap)
            const bw90 = span(c, l90, gap)
            const bh90 = span(d, w90, gap)
            if (bw0 + gap + bw90 > L + 1e-6 || bh0 + gap + bh90 > W + 1e-6) continue
            const slots = [
              ...block(0, 0, a, b, l0, w0, gap, 0),
              ...block(L - bw90, 0, c, d, l90, w90, gap, 90),
              ...block(L - bw0, W - bh0, a, b, l0, w0, gap, 0),
              ...block(0, W - bh90, c, d, l90, w90, gap, 90),
            ]
            if (!slotsValid(slots, L, W)) continue
            if (gap > 0 && !respectsGap(slots, gap)) continue
            bestPin = slots
          }
        }
      }
    }
    if (bestPin.length) {
      candidates.push(finalize('pinwheel', 'Wiatraczek', 'Cztery bloki wokół środka, na przemian 0° i 90°', bestPin, pallet, product, options))
    }
  }

  const unique = new Map<string, PatternCandidate>()
  for (const c of candidates) {
    if (c && !unique.has(c.id)) unique.set(c.id, c)
  }
  return [...unique.values()].sort((a, b) => b.count - a.count || b.fill - a.fill || a.rotated - b.rotated)
}

function respectsGap(slots: Slot[], gap: number): boolean {
  const g = gap - 1e-6
  for (let a = 0; a < slots.length; a++) {
    for (let b = a + 1; b < slots.length; b++) {
      const dx = Math.max(slots[a].x - (slots[b].x + slots[b].w), slots[b].x - (slots[a].x + slots[a].w))
      const dy = Math.max(slots[a].y - (slots[b].y + slots[b].h), slots[b].y - (slots[a].y + slots[a].h))
      if (dx < g && dy < g) return false
    }
  }
  return true
}

/** Obrys układu (do miniatur). */
export function patternBounds(items: Placement[], product: Product) {
  return rectsBounds(items.map((i) => placementRect(i, product)))
}
