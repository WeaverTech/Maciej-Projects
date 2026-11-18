import { describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import { generatePatterns } from '../../src/core/generator'
import { overhang, overlapDepth, placementRect } from '../../src/core/geometry'
import type { Pallet, Product } from '../../src/core/types'

const base = createProject()
const pallet = (length: number, width: number): Pallet => ({ ...base.pallet, length, width })
const product = (length: number, width: number): Product => ({ ...base.product, length, width })

function assertValid(pal: Pallet, prod: Product, overhangLimit = 0, gap = 0) {
  const patterns = generatePatterns(pal, prod, { overhang: overhangLimit, gap })
  expect(patterns.length).toBeGreaterThan(0)
  for (const pattern of patterns) {
    const rects = pattern.items.map((i) => placementRect(i, prod))
    for (const r of rects) expect(overhang(r, pal)).toBeLessThanOrEqual(overhangLimit + 1e-6)
    for (let a = 0; a < rects.length; a++) {
      for (let b = a + 1; b < rects.length; b++) expect(overlapDepth(rects[a], rects[b])).toBe(0)
    }
    expect(pattern.items.map((i) => i.order)).toEqual(pattern.items.map((_, idx) => idx + 1))
    expect(new Set(pattern.items.map((i) => i.id)).size).toBe(pattern.count)
  }
  return patterns
}

describe('generator układów', () => {
  it('EUR 1200×800 i worek 600×400: siatka 2×2', () => {
    const patterns = assertValid(pallet(1200, 800), product(600, 400))
    expect(patterns[0].count).toBe(4)
    expect(patterns[0].fill).toBeCloseTo(1)
  })

  it('1200×1000 i worek 600×400: układ dzielony 3+2', () => {
    const patterns = assertValid(pallet(1200, 1000), product(600, 400))
    expect(patterns[0].count).toBe(5)
    expect(patterns[0].kind).toBe('split-y')
    expect(patterns[0].rotated).toBe(3)
    expect(patterns[0].fill).toBeCloseTo(1)
  })

  it('1200×800 i karton 300×200: pełna siatka 16 szt.', () => {
    const patterns = assertValid(pallet(1200, 800), product(300, 200))
    expect(patterns[0].count).toBe(16)
  })

  it('1000×1000 i karton 600×400: wiatraczek 4 szt.', () => {
    const patterns = assertValid(pallet(1000, 1000), product(600, 400))
    const pinwheel = patterns.find((p) => p.kind === 'pinwheel')
    expect(pinwheel?.count).toBe(4)
    expect(patterns[0].count).toBe(4)
  })

  it('układ jest wyśrodkowany na palecie', () => {
    const pal = pallet(1200, 800)
    const prod = product(500, 300)
    for (const pattern of generatePatterns(pal, prod)) {
      const rects = pattern.items.map((i) => placementRect(i, prod))
      const minX = Math.min(...rects.map((r) => r.x1))
      const maxX = Math.max(...rects.map((r) => r.x2))
      const minY = Math.min(...rects.map((r) => r.y1))
      const maxY = Math.max(...rects.map((r) => r.y2))
      expect(minX + maxX).toBeCloseTo(1200, 3)
      expect(minY + maxY).toBeCloseTo(800, 3)
    }
  })

  it('dopuszczalne wystawanie zwiększa liczbę produktów', () => {
    const none = generatePatterns(pallet(1200, 800), product(620, 410))
    const allowed = assertValid(pallet(1200, 800), product(620, 410), 30)
    expect(none[0].count).toBe(2)
    expect(allowed[0].count).toBe(4)
  })

  it('odstęp między produktami jest zachowany', () => {
    const pal = pallet(1200, 800)
    const prod = product(290, 190)
    const patterns = assertValid(pal, prod, 0, 10)
    for (const pattern of patterns) {
      const rects = pattern.items.map((i) => placementRect(i, prod))
      for (let a = 0; a < rects.length; a++) {
        for (let b = a + 1; b < rects.length; b++) {
          const dx = Math.max(rects[a].x1 - rects[b].x2, rects[b].x1 - rects[a].x2)
          const dy = Math.max(rects[a].y1 - rects[b].y2, rects[b].y1 - rects[a].y2)
          expect(Math.max(dx, dy)).toBeGreaterThanOrEqual(10 - 1e-6)
        }
      }
    }
  })

  it('limit liczby produktów', () => {
    const patterns = generatePatterns(pallet(1200, 800), product(300, 200), { maxCount: 5 })
    expect(patterns.every((p) => p.count <= 5)).toBe(true)
    expect(patterns[0].items.map((i) => i.order)).toEqual([1, 2, 3, 4, 5])
  })

  it('produkt większy od palety nie daje układów', () => {
    expect(generatePatterns(pallet(800, 600), product(1000, 900))).toEqual([])
  })

  it('produkt kwadratowy daje jedną siatkę', () => {
    const patterns = generatePatterns(pallet(1200, 800), product(400, 400))
    expect(patterns).toHaveLength(1)
    expect(patterns[0].count).toBe(6)
  })
})
