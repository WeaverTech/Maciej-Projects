import { describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import {
  alignItems,
  autoOrder,
  centerOnPallet,
  compactOrders,
  compareAB,
  isExactRotation,
  layerSequence,
  moveOrder,
  rotate180,
  rotatedLayerB,
  syncLinkedLayers,
  templateForLayer,
} from '../../src/core/layers'
import type { Placement } from '../../src/core/types'

const item = (id: number, x: number, y: number, rotation: Placement['rotation'] = 0, order = id): Placement => ({ id, x, y, rotation, order })

describe('warstwa B', () => {
  it('obrót A o 180° względem środka palety', () => {
    const project = createProject()
    expect(rotate180(item(1, 300, 200, 0), project.pallet)).toEqual(item(1, 900, 600, 180))
    expect(rotate180(item(2, 600, 400, 270, 5), project.pallet)).toEqual(item(2, 600, 400, 90, 5))
  })

  it('dwukrotny obrót wraca do punktu wyjścia', () => {
    const project = createProject()
    const start = item(1, 123.4, 567.8, 90)
    expect(rotate180(rotate180(start, project.pallet), project.pallet)).toEqual(start)
  })

  it('powiązana warstwa B podąża za zmianami A', () => {
    const project = createProject()
    project.layers.A.items = [item(1, 300, 200)]
    project.layers.B = { name: 'B', items: [], link: 'rot180' }
    syncLinkedLayers(project)
    expect(project.layers.B.items).toEqual([item(1, 900, 600, 180)])
    project.layers.A.items[0].x = 350
    syncLinkedLayers(project)
    expect(project.layers.B.items[0].x).toBe(850)
    expect(compareAB(project)).toEqual([{ severity: 'info', message: 'Warstwy A/B są zgodne' }])
    expect(isExactRotation(project)).toBe(true)
  })

  it('odłączona warstwa B nie jest nadpisywana i jest porównywana z A', () => {
    const project = createProject()
    project.layers.A.items = [item(1, 300, 200), item(2, 900, 200)]
    project.layers.B = { name: 'B', items: rotatedLayerB(project), link: null }
    project.layers.B.items[0].x += 15
    project.layers.B.items[1].rotation = 90
    syncLinkedLayers(project)
    const res = compareAB(project)
    expect(res).toContainEqual({ severity: 'warning', message: 'Produkt 1: pozycja B różni się od obrotu 180°', order: 1 })
    expect(res).toContainEqual({ severity: 'warning', message: 'Produkt 2: niezgodny obrót', order: 2 })
    project.layers.B.items.pop()
    expect(compareAB(project)).toContainEqual({ severity: 'error', message: 'Produkt 2 nie występuje w obu warstwach', order: 2 })
    expect(isExactRotation(project)).toBe(false)
  })

  it('sekwencja warstw A/B/A/B', () => {
    const project = createProject()
    project.robot.layers = 5
    expect(layerSequence(project)).toEqual(['A', 'A', 'A', 'A', 'A'])
    project.layers.B = { name: 'B', items: [], link: 'rot180' }
    expect(layerSequence(project)).toEqual(['A', 'B', 'A', 'B', 'A'])
    expect(templateForLayer(project, 1)).toBe('A')
    expect(templateForLayer(project, 2)).toBe('B')
  })
})

describe('kolejność', () => {
  const product = { length: 600, width: 400 }
  const grid = [item(1, 900, 600), item(2, 300, 200), item(3, 900, 200), item(4, 300, 600)]
  const orderOf = (items: Placement[]) => [...items].sort((a, b) => a.order - b.order).map((i) => i.id)

  it('numeracja rzędami od narożnika A', () => {
    expect(orderOf(autoOrder(grid, product, 'rows', 'A'))).toEqual([2, 3, 4, 1])
  })

  it('numeracja wężykiem', () => {
    expect(orderOf(autoOrder(grid, product, 'snake-rows', 'A'))).toEqual([2, 3, 1, 4])
  })

  it('numeracja kolumnami od narożnika C', () => {
    expect(orderOf(autoOrder(grid, product, 'columns', 'C'))).toEqual([1, 3, 4, 2])
  })

  it('toleruje drobne różnice położenia w rzędzie', () => {
    const wobbly = [item(1, 900, 215), item(2, 300, 190), item(3, 300, 610), item(4, 900, 590)]
    expect(orderOf(autoOrder(wobbly, product, 'rows', 'A'))).toEqual([2, 1, 3, 4])
  })

  it('zagęszcza numerację po usunięciu produktu', () => {
    const items = [item(1, 0, 0, 0, 1), item(3, 0, 0, 0, 3), item(7, 0, 0, 0, 6)]
    expect(compactOrders(items).map((i) => i.order)).toEqual([1, 2, 3])
  })

  it('przenosi produkt na wskazaną pozycję', () => {
    const items = [item(1, 0, 0), item(2, 0, 0), item(3, 0, 0), item(4, 0, 0)]
    expect(orderOf(moveOrder(items, 4, 1))).toEqual([4, 1, 2, 3])
    expect(orderOf(moveOrder(items, 1, 3))).toEqual([2, 3, 1, 4])
    expect(orderOf(moveOrder(items, 2, 99))).toEqual([1, 3, 4, 2])
  })
})

describe('narzędzia układu', () => {
  it('wyśrodkowanie układu na palecie', () => {
    const project = createProject()
    const items = [item(1, 300, 200), item(2, 900, 200)]
    const centered = centerOnPallet(items, project.product, project.pallet)
    expect(centered.map((i) => [i.x, i.y])).toEqual([
      [300, 400],
      [900, 400],
    ])
  })

  it('wyrównanie krawędzi zaznaczonych produktów', () => {
    const project = createProject()
    const items = [item(1, 300, 200), item(2, 500, 700, 90), item(3, 1000, 100)]
    const aligned = alignItems(items, [1, 2], project.product, 'left')
    expect(aligned[0].x).toBe(300)
    expect(aligned[1].x).toBe(200)
    expect(aligned[2].x).toBe(1000)
  })
})
