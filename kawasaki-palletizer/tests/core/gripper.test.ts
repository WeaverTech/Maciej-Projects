import { describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import { autoPairCycles, formatCycles, parseCycles, parseSignal, projectCycles, sectionByProduct } from '../../src/core/gripper'

describe('cykle chwytaka', () => {
  it('chwyt pojedynczy: każdy produkt osobno na sekcji 1', () => {
    const project = createProject()
    project.layers.A.items = [3, 1, 2].map((n) => ({ id: n, x: 0, y: 0, rotation: 0 as const, order: n }))
    const { cycles, errors } = projectCycles(project)
    expect(errors).toEqual([])
    expect(cycles).toEqual([[{ product: 1, section: 1 }], [{ product: 2, section: 1 }], [{ product: 3, section: 1 }]])
  })

  it('chwyt podwójny: poprawna konfiguracja', () => {
    const { cycles, errors } = parseCycles('1=1,2=2;3=1,4=2;5=1,6=2', [1, 2, 3, 4, 5, 6])
    expect(errors).toEqual([])
    expect(cycles).toHaveLength(3)
    expect(cycles[1]).toEqual([
      { product: 3, section: 1 },
      { product: 4, section: 2 },
    ])
  })

  it('toleruje spacje i pojedynczy produkt w cyklu', () => {
    const { cycles, errors } = parseCycles(' 1 = 1 , 2 = 2 ; 3 = 2 ', [1, 2, 3])
    expect(errors).toEqual([])
    expect(cycles[1]).toEqual([{ product: 3, section: 2 }])
  })

  it('zgłasza brakujące i powtórzone produkty', () => {
    expect(parseCycles('1=1,2=2;2=1', [1, 2, 3]).errors).toEqual(['Produkt 2 występuje ponownie', 'Nieprzypisane produkty: 3'])
  })

  it('zgłasza tę samą sekcję użytą dwa razy w cyklu', () => {
    expect(parseCycles('1=1,2=1', [1, 2]).errors).toEqual(['Cykl 1: sekcja 1 użyta dwa razy', 'Nieprzypisane produkty: 2'])
  })

  it('zgłasza pustą konfigurację i błędny format', () => {
    expect(parseCycles('  ', [1]).errors).toEqual(['Brak konfiguracji cykli'])
    expect(parseCycles('1-1', [1]).errors).toEqual(['Cykl 1: wymagany format produkt=sekcja', 'Nieprzypisane produkty: 1'])
  })

  it('automatyczne parowanie i zapis tekstowy', () => {
    const cycles = autoPairCycles([5, 1, 2, 4, 3])
    expect(formatCycles(cycles)).toBe('1=1,2=2;3=1,4=2;5=1')
    expect(parseCycles(formatCycles(cycles), [1, 2, 3, 4, 5]).errors).toEqual([])
  })

  it('mapa produkt → sekcja', () => {
    const project = createProject()
    project.layers.A.items = [1, 2, 3, 4].map((n) => ({ id: n, x: 0, y: 0, rotation: 0 as const, order: n }))
    project.robot.pickMode = 'podwojny'
    project.robot.assignments = '1=1,2=2;3=1,4=2'
    const map = sectionByProduct(project)
    expect(map.get(4)).toEqual({ section: 2, cycle: 2 })
  })
})

describe('sygnały', () => {
  it('akceptuje listę numerów ze znakiem', () => {
    expect(parseSignal('12,-13')).toEqual({ ok: true, values: [12, -13] })
    expect(parseSignal(' 2001 ').ok).toBe(true)
  })

  it('odrzuca puste i błędne wartości', () => {
    expect(parseSignal('').ok).toBe(false)
    expect(parseSignal('12,').ok).toBe(false)
    expect(parseSignal('a').ok).toBe(false)
    expect(parseSignal('0').ok).toBe(false)
    expect(parseSignal('1.5').ok).toBe(false)
  })
})
