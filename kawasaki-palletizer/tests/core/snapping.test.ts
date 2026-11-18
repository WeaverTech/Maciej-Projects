import { describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import { snapMeasurePoint, snapMove } from '../../src/core/snapping'
import { projectStats } from '../../src/core/stats'
import { createExampleProject } from '../../src/core/example'

const pallet = createProject().pallet
const options = { enabled: true, tolerance: 15, grid: true, gridStep: 50 }
const rect = (x1: number, y1: number, w = 600, h = 400) => ({ x1, y1, x2: x1 + w, y2: y1 + h })

describe('przyciąganie', () => {
  it('do krawędzi palety', () => {
    const res = snapMove(rect(8, -6), [], pallet, options)
    expect(res.dx).toBe(-8)
    expect(res.dy).toBe(6)
    expect(res.guides).toHaveLength(2)
  })

  it('do krawędzi sąsiedniego produktu (styk)', () => {
    const res = snapMove(rect(607, 3), [rect(0, 0)], pallet, options)
    expect(res.dx).toBe(-7)
    expect(res.dy).toBe(-3)
  })

  it('styk ma pierwszeństwo przed siatką', () => {
    const res = snapMove(rect(338, 420, 400, 300), [rect(0, 400, 330, 300)], pallet, options)
    expect(res.dx).toBe(-8)
  })

  it('do siatki, gdy nie ma bliższego punktu', () => {
    const res = snapMove(rect(120, 130, 200, 100), [], pallet, options)
    expect(res.dx).toBe(-20)
    expect(res.dy).toBe(20)
    expect(res.guides).toEqual([])
  })

  it('wyłączone przyciąganie nie zmienia położenia', () => {
    expect(snapMove(rect(8, 6), [], pallet, { ...options, enabled: false })).toEqual({ dx: 0, dy: 0, guides: [] })
  })

  it('bez siatki i poza tolerancją nie przesuwa', () => {
    const res = snapMove(rect(120, 130, 200, 100), [], pallet, { ...options, grid: false })
    expect(res.dx).toBe(0)
    expect(res.dy).toBe(0)
  })
})

describe('miarka', () => {
  it('przyciąga do narożników palety i produktów', () => {
    expect(snapMeasurePoint({ x: 5, y: 795 }, [], pallet, 20)).toEqual({ point: { x: 0, y: 800 }, snapped: true })
    expect(snapMeasurePoint({ x: 610, y: 395 }, [rect(0, 0)], pallet, 20)).toEqual({ point: { x: 600, y: 400 }, snapped: true })
    expect(snapMeasurePoint({ x: 400, y: 300 }, [], pallet, 20).snapped).toBe(false)
  })
})

describe('statystyki', () => {
  it('projekt przykładowy', () => {
    const stats = projectStats(createExampleProject())
    expect(stats.perLayerA).toBe(5)
    expect(stats.perLayerB).toBe(5)
    expect(stats.layers).toBe(8)
    expect(stats.totalProducts).toBe(40)
    expect(stats.stackHeight).toBe(960)
    expect(stats.fill).toBeCloseTo(1)
    expect(stats.cyclesPerLayer).toBe(5)
  })

  it('przekładki zwiększają wysokość stosu', () => {
    const p = createExampleProject()
    p.slipSheet = { enabled: true, thickness: 5, every: 2, callProgram: '' }
    const stats = projectStats(p)
    expect(stats.slipSheets).toBe(3)
    expect(stats.stackHeight).toBe(975)
  })
})
