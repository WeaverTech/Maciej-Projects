import { describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import {
  axesValid,
  CORNERS,
  DIRECTIONS,
  footprint,
  fromBase,
  orientationO,
  overhang,
  overlapDepth,
  perpendicularDirections,
  placementRect,
  rotationInBase,
  toBase,
  zAxisDirection,
} from '../../src/core/geometry'
import type { Pallet } from '../../src/core/types'
import transforms from '../fixtures/legacy/transforms.json'

const pallet = (over: Partial<Pallet> = {}): Pallet => ({ ...createProject().pallet, ...over })

describe('transformacja plansza → BASE', () => {
  it('BASE w D, +X w prawo, +Y w górę', () => {
    expect(toBase(100, 600, pallet())).toEqual({ x: 100, y: 200 })
  })

  it('jest zgodna z wersją 2.3 dla wszystkich narożników i kierunków osi', () => {
    expect(transforms.length).toBe(256)
    for (const row of transforms) {
      const p = pallet({
        baseCorner: row.corner as Pallet['baseCorner'],
        xDirection: row.x_direction as Pallet['xDirection'],
        yDirection: row.y_direction as Pallet['yDirection'],
      })
      const b = toBase(row.x, row.y, p)
      expect(b.x).toBeCloseTo(row.bx, 9)
      expect(b.y).toBeCloseTo(row.by, 9)
      expect(axesValid(p)).toBe(row.valid)
    }
  })

  it('każdy narożnik BASE daje (0,0) w swoim punkcie', () => {
    const corners = { A: [0, 0], B: [1200, 0], C: [1200, 800], D: [0, 800] } as const
    for (const c of CORNERS) {
      const [x, y] = corners[c]
      expect(toBase(x, y, pallet({ baseCorner: c }))).toEqual({ x: 0, y: 0 })
    }
  })

  it('fromBase jest odwrotnością toBase dla wszystkich poprawnych układów osi', () => {
    for (const corner of CORNERS) {
      for (const xDirection of DIRECTIONS) {
        for (const yDirection of perpendicularDirections(xDirection)) {
          const p = pallet({ baseCorner: corner, xDirection, yDirection })
          const b = toBase(333.5, 12.25, p)
          const back = fromBase(b.x, b.y, p)
          expect(back.x).toBeCloseTo(333.5, 9)
          expect(back.y).toBeCloseTo(12.25, 9)
        }
      }
    }
  })

  it('nie zwraca ujemnego zera', () => {
    const b = toBase(1200, 0, pallet({ baseCorner: 'B', xDirection: 'lewo', yDirection: 'dol' }))
    expect(Object.is(b.x, -0)).toBe(false)
    expect(Object.is(b.y, -0)).toBe(false)
  })
})

describe('osie', () => {
  it('odrzuca osie równoległe', () => {
    expect(axesValid(pallet({ xDirection: 'prawo', yDirection: 'lewo' }))).toBe(false)
    expect(axesValid(pallet({ xDirection: 'gora', yDirection: 'gora' }))).toBe(false)
    expect(axesValid(pallet({ xDirection: 'gora', yDirection: 'lewo' }))).toBe(true)
  })

  it('wyznacza zwrot osi Z układu prawoskrętnego', () => {
    expect(zAxisDirection(pallet())).toBe('up')
    expect(zAxisDirection(pallet({ xDirection: 'prawo', yDirection: 'dol' }))).toBe('down')
    expect(zAxisDirection(pallet({ xDirection: 'gora', yDirection: 'lewo' }))).toBe('up')
    expect(zAxisDirection(pallet({ xDirection: 'prawo', yDirection: 'lewo' }))).toBeNull()
  })
})

describe('orientacja produktu', () => {
  it('dla domyślnych osi kąt BASE równa się obrotowi na planszy', () => {
    for (const r of [0, 90, 180, 270]) expect(rotationInBase(r, pallet())).toBe(r)
  })

  it('dla układu z osią Z w dół kierunek obrotu jest przeciwny', () => {
    const p = pallet({ baseCorner: 'A', xDirection: 'prawo', yDirection: 'dol' })
    expect(rotationInBase(0, p)).toBe(0)
    expect(rotationInBase(90, p)).toBe(270)
    expect(rotationInBase(180, p)).toBe(180)
    expect(rotationInBase(270, p)).toBe(90)
  })

  it('obrócone osie przesuwają kąt o 90°', () => {
    const p = pallet({ baseCorner: 'C', xDirection: 'gora', yDirection: 'lewo' })
    expect(rotationInBase(0, p)).toBe(270)
    expect(rotationInBase(90, p)).toBe(0)
  })

  it('tryb zgodności 2.3 i offset O', () => {
    const project = createProject()
    project.pallet = pallet({ baseCorner: 'A', xDirection: 'prawo', yDirection: 'dol' })
    project.robot.orientationMode = 'legacy'
    expect(orientationO(90, project)).toBe(90)
    project.robot.orientationMode = 'base'
    expect(orientationO(90, project)).toBe(270)
    project.robot.oOffset = 90
    expect(orientationO(90, project)).toBe(0)
    project.robot.oOffset = -45.5
    expect(orientationO(0, project)).toBe(314.5)
  })
})

describe('obrysy', () => {
  const product = { length: 600, width: 400 }

  it('obrót 90° i 270° zamienia długość z szerokością', () => {
    expect(footprint(product, 0)).toEqual([600, 400])
    expect(footprint(product, 90)).toEqual([400, 600])
    expect(footprint(product, 180)).toEqual([600, 400])
    expect(footprint(product, 270)).toEqual([400, 600])
  })

  it('pozycja oznacza środek obrysu', () => {
    expect(placementRect({ x: 300, y: 200, rotation: 0 }, product)).toEqual({ x1: 0, y1: 0, x2: 600, y2: 400 })
    expect(placementRect({ x: 300, y: 200, rotation: 90 }, product)).toEqual({ x1: 100, y1: -100, x2: 500, y2: 500 })
  })

  it('wystawanie i nakładanie', () => {
    const p = pallet()
    expect(overhang({ x1: 0, y1: 0, x2: 600, y2: 400 }, p)).toBe(0)
    expect(overhang({ x1: -30, y1: 0, x2: 570, y2: 400 }, p)).toBe(30)
    expect(overhang({ x1: 700, y1: 500, x2: 1300, y2: 900 }, p)).toBe(100)
    expect(overlapDepth({ x1: 0, y1: 0, x2: 600, y2: 400 }, { x1: 600, y1: 0, x2: 1200, y2: 400 })).toBe(0)
    expect(overlapDepth({ x1: 0, y1: 0, x2: 600, y2: 400 }, { x1: 580, y1: 0, x2: 1180, y2: 400 })).toBeCloseTo(20)
    // Szum zmiennoprzecinkowy nie może dawać kolizji „0.0 mm”.
    expect(overlapDepth({ x1: 0, y1: 0, x2: 0.1 + 0.2, y2: 400 }, { x1: 0.3, y1: 0, x2: 600, y2: 400 })).toBe(0)
  })
})
