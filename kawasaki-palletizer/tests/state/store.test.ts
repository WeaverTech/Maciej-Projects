import { beforeEach, describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import { createExampleProject } from '../../src/core/example'
import { rotatedLayerB, sortedByOrder } from '../../src/core/layers'
import { isDirty, isLayerEditable, resetStore, useStore } from '../../src/state/store'

const s = () => useStore.getState()

beforeEach(() => {
  localStorage.clear()
  resetStore(createProject())
})

describe('edycja warstwy', () => {
  it('dodaje produkty w wolnych miejscach i nadaje kolejne numery', () => {
    s().addItem()
    s().addItem()
    const items = s().project.layers.A.items
    expect(items.map((i) => i.order)).toEqual([1, 2])
    expect(items[0].x).not.toBe(items[1].x)
    expect(s().selection).toEqual([items[1].id])
  })

  it('usuwa zaznaczone i zagęszcza numerację', () => {
    s().addItem()
    s().addItem()
    s().addItem()
    const [first] = s().project.layers.A.items
    s().select([first.id])
    s().deleteSelected()
    expect(s().project.layers.A.items.map((i) => i.order)).toEqual([1, 2])
    expect(s().selection).toEqual([])
  })

  it('obraca o 90° i wraca do 0° po czterech obrotach', () => {
    s().addItem()
    const id = s().project.layers.A.items[0].id
    s().select([id])
    s().rotateSelected()
    expect(s().project.layers.A.items[0].rotation).toBe(90)
    s().rotateSelected()
    s().rotateSelected()
    s().rotateSelected()
    expect(s().project.layers.A.items[0].rotation).toBe(0)
  })

  it('przesunięcie strzałkami tworzy jeden krok cofania', () => {
    s().addItem()
    const before = { ...s().project.layers.A.items[0] }
    s().nudgeSelected(1, 0)
    s().nudgeSelected(1, 0)
    s().nudgeSelected(0, 10)
    expect(s().project.layers.A.items[0]).toMatchObject({ x: before.x + 2, y: before.y + 10 })
    s().undo()
    expect(s().project.layers.A.items[0]).toMatchObject({ x: before.x, y: before.y })
  })

  it('duplikuje zaznaczenie obok oryginału', () => {
    s().addItem()
    s().duplicateSelected()
    const items = s().project.layers.A.items
    expect(items).toHaveLength(2)
    expect(items[1].order).toBe(2)
    expect(s().selection).toEqual([items[1].id])
  })

  it('kopiuj / wklej', () => {
    s().addItem()
    s().copySelected()
    s().paste()
    expect(s().project.layers.A.items).toHaveLength(2)
  })

  it('zmiana numeru przesuwa pozostałe produkty', () => {
    s().addItem()
    s().addItem()
    s().addItem()
    const ids = s().project.layers.A.items.map((i) => i.id)
    s().setItemOrder(ids[2], 1)
    expect(sortedByOrder(s().project.layers.A.items).map((i) => i.id)).toEqual([ids[2], ids[0], ids[1]])
  })

  it('kolejność klikaniem kończy narzędzie po ostatnim produkcie', () => {
    s().addItem()
    s().addItem()
    const ids = s().project.layers.A.items.map((i) => i.id)
    s().setTool('order')
    s().clickOrder(ids[1])
    expect(s().orderCursor).toBe(2)
    s().clickOrder(ids[0])
    expect(s().tool).toBe('select')
    expect(sortedByOrder(s().project.layers.A.items).map((i) => i.id)).toEqual([ids[1], ids[0]])
  })
})

describe('cofanie i ponawianie', () => {
  it('cofa i ponawia zmiany', () => {
    s().addItem()
    s().addItem()
    s().undo()
    expect(s().project.layers.A.items).toHaveLength(1)
    s().redo()
    expect(s().project.layers.A.items).toHaveLength(2)
  })

  it('gest przeciągania to jeden krok historii', () => {
    s().addItem()
    const item = s().project.layers.A.items[0]
    const history = s().past.length
    s().beginGesture()
    for (let i = 1; i <= 5; i++) s().moveItems(new Map([[item.id, { x: item.x + i * 10, y: item.y }]]), true)
    s().endGesture()
    expect(s().past.length).toBe(history + 1)
    s().undo()
    expect(s().project.layers.A.items[0].x).toBe(item.x)
  })

  it('nowa zmiana czyści kolejkę ponawiania', () => {
    s().addItem()
    s().undo()
    s().addItem()
    expect(s().future).toHaveLength(0)
  })
})

describe('warstwa B', () => {
  it('powiązana warstwa B śledzi zmiany warstwy A i jest tylko do odczytu', () => {
    s().addItem()
    s().createLayerB('rot180')
    expect(s().activeLayer).toBe('B')
    expect(isLayerEditable(s().project, 'B')).toBe(false)
    s().addItem()
    expect(s().project.layers.B!.items).toHaveLength(1)

    s().setActiveLayer('A')
    s().addItem()
    expect(s().project.layers.B!.items).toEqual(rotatedLayerB(s().project))
    expect(s().project.layers.B!.items).toHaveLength(2)
  })

  it('odłączona warstwa B jest edytowalna niezależnie', () => {
    s().addItem()
    s().createLayerB('rot180')
    s().setLayerBLink(false)
    s().addItem()
    expect(s().project.layers.B!.items).toHaveLength(2)
    expect(s().project.layers.A.items).toHaveLength(1)
  })

  it('usunięcie warstwy B wraca do warstwy A', () => {
    s().createLayerB('copy')
    s().removeLayerB()
    expect(s().project.layers.B).toBeUndefined()
    expect(s().activeLayer).toBe('A')
  })

  it('zmiana BASE i osi nie przesuwa produktów na planszy', () => {
    resetStore(createExampleProject())
    const before = JSON.stringify(s().project.layers)
    s().setPallet({ baseCorner: 'B', xDirection: 'lewo', yDirection: 'dol' })
    expect(JSON.stringify(s().project.layers)).toBe(before)
  })
})

describe('chwyt podwójny', () => {
  it('przełączenie na chwyt podwójny paruje produkty kolejno', () => {
    for (let i = 0; i < 4; i++) s().addItem()
    s().setRobot({ pickMode: 'podwojny' })
    expect(s().project.robot.assignments).toBe('1=1,2=2;3=1,4=2')
  })

  it('dodany produkt trafia do niepełnego lub nowego cyklu', () => {
    for (let i = 0; i < 2; i++) s().addItem()
    s().setRobot({ pickMode: 'podwojny' })
    s().addItem()
    expect(s().project.robot.assignments).toBe('1=1,2=2;3=1')
    s().addItem()
    expect(s().project.robot.assignments).toBe('1=1,2=2;3=1,4=2')
  })

  it('usunięcie produktu przepisuje cykle na nową numerację', () => {
    for (let i = 0; i < 4; i++) s().addItem()
    s().setRobot({ pickMode: 'podwojny' })
    const second = sortedByOrder(s().project.layers.A.items)[1]
    s().select([second.id])
    s().deleteSelected()
    expect(s().project.robot.assignments).toBe('1=1;2=1,3=2')
  })

  it('zastosowanie wzoru z generatora odświeża cykle', () => {
    s().setRobot({ pickMode: 'podwojny' })
    s().applyPattern(createExampleProject().layers.A.items)
    expect(s().project.robot.assignments).toBe('1=1,2=2;3=1,4=2;5=1')
  })
})

describe('stan pliku', () => {
  it('projekt jest „brudny” po zmianie i czysty po zapisie', () => {
    expect(isDirty(s())).toBe(false)
    s().addItem()
    expect(isDirty(s())).toBe(true)
    s().markSaved('test.json', null)
    expect(isDirty(s())).toBe(false)
    expect(s().fileName).toBe('test.json')
  })

  it('wczytanie projektu czyści historię i zaznaczenie', () => {
    s().addItem()
    s().loadProject(createExampleProject(), 'worki.json')
    expect(s().past).toHaveLength(0)
    expect(s().selection).toEqual([])
    expect(s().project.layers.A.items).toHaveLength(5)
    expect(isDirty(s())).toBe(false)
  })
})
