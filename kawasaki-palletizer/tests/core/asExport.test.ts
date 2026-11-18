import { describe, expect, it } from 'vitest'
import { AsExportError, formatNumber, layerZOffset, renderAs, slipSheetsBelow, toAscii } from '../../src/core/asExport'
import { validateAs } from '../../src/core/asValidator'
import { createProject } from '../../src/core/defaults'
import { createExampleProject } from '../../src/core/example'
import type { Project } from '../../src/core/types'

function sample(count = 6): Project {
  const p = createProject()
  p.layers.A.items = Array.from({ length: count }, (_, i) => ({ id: i + 1, x: (i + 1) * 100, y: 200, rotation: 0 as const, order: i + 1 }))
  return p
}

describe('eksport AS', () => {
  it('chwyt pojedynczy: osobne pobranie dla każdego produktu', () => {
    const code = renderAs(sample())
    expect(code.match(/JMOVE pobierz_najazd/g)).toHaveLength(6)
    expect(code.match(/SIGNAL 12,-13/g)).toHaveLength(6)
    expect(code).not.toContain('SIGNAL 10,-11')
    expect(validateAs(code)).toEqual([])
  })

  it('chwyt podwójny: jedno pobranie na dwa produkty, każda sekcja zwalniana osobno', () => {
    const p = sample()
    p.robot.pickMode = 'podwojny'
    const code = renderAs(p)
    expect(code.match(/JMOVE pobierz_najazd/g)).toHaveLength(3)
    expect(code.match(/SIGNAL 12,-13/g)).toHaveLength(3)
    expect(code.match(/SIGNAL 10,-11/g)).toHaveLength(3)
    expect(code.match(/SIGNAL -12,13/g)).toHaveLength(3)
    expect(code.match(/SIGNAL -10,11/g)).toHaveLength(3)
    const cycle1 = code.slice(code.indexOf('; CYKL 1'), code.indexOf('; CYKL 2'))
    expect(cycle1.indexOf('SIGNAL 10,-11')).toBeLessThan(cycle1.indexOf('cel[1]'))
    expect(cycle1.indexOf('SIGNAL -12,13')).toBeLessThan(cycle1.indexOf('cel[2]'))
    expect(validateAs(code)).toEqual([])
  })

  it('punkty są generowane względem BASE ze środka produktu', () => {
    const code = renderAs(sample(1))
    expect(code).toContain('POINT wa_cel[1] = poczatekpal+TRANS(100.000,600.000,-100.000,0,0,0)')
  })

  it('warstwy A/B wybierane przez .j MOD 2', () => {
    const p = createExampleProject()
    const code = renderAs(p)
    expect(code).toContain('IF (.j MOD 2)==1 THEN')
    expect(code).toContain('POINT cel[1] = wb_cel[1]')
    expect(code.match(/POINT wb_cel\[/g)).toHaveLength(p.layers.A.items.length)
    expect(validateAs(code)).toEqual([])
  })

  it('nagłówek jest w ASCII i wewnątrz programu', () => {
    const p = sample(1)
    p.name = 'Żółte worki – próba'
    const code = renderAs(p, { date: new Date('2026-11-18T10:00:00Z') })
    const lines = code.split('\n')
    expect(lines[0]).toBe('.PROGRAM paletyzacja()')
    expect(code).toContain('; Projekt: Zolte worki ? proba')
    expect(code).toContain('; Data: 2026-11-18')
    // eslint-disable-next-line no-control-regex
    expect(/[^\x00-\x7f]/.test(code)).toBe(false)
    expect(renderAs(p, { header: false })).not.toContain('; Projekt')
  })

  it('parametry ruchu i czasy', () => {
    const p = sample(1)
    p.robot.speed = 80
    p.robot.accel = 60.5
    p.robot.gripWait = 0.75
    const code = renderAs(p)
    expect(code).toContain('SPEED 80 ALWAYS')
    expect(code).toContain('ACCEL 60.5 ALWAYS')
    expect(code).toContain('TWAIT 0.75')
  })

  it('blokuje eksport przy pustej warstwie, błędnych osiach i cyklach', () => {
    expect(() => renderAs(createProject())).toThrow(AsExportError)
    const axes = sample()
    axes.pallet.yDirection = 'prawo'
    expect(() => renderAs(axes)).toThrow('Osie X/Y muszą być prostopadłe')
    const cycles = sample()
    cycles.robot.pickMode = 'podwojny'
    cycles.robot.assignments = '1=1,2=2'
    expect(() => renderAs(cycles)).toThrow('Nieprzypisane produkty: 3, 4, 5, 6')
  })
})

describe('wysokość warstw i przekładki', () => {
  it('bez przekładek: (j-1) * przyrost', () => {
    const p = sample(1)
    p.product.layerIncrement = 120
    expect(layerZOffset(p, 1)).toBe(0)
    expect(layerZOffset(p, 4)).toBe(360)
    expect(renderAs(p)).toContain('.z_offset = (.j-1)*.wyswarstwy\n')
  })

  it('przekładka po każdej warstwie', () => {
    const p = sample(1)
    p.slipSheet = { enabled: true, thickness: 5, every: 1, callProgram: '' }
    expect(slipSheetsBelow(p, 1)).toBe(0)
    expect(slipSheetsBelow(p, 3)).toBe(2)
    expect(layerZOffset(p, 3)).toBe(210)
    const code = renderAs(p)
    expect(code).toContain('.grubprzekl = 5')
    expect(code).toContain('.z_offset = (.j-1)*.wyswarstwy+(.j-1)*.grubprzekl')
    expect(code).toContain('; PRZEKLADKA przed kazda kolejna warstwa - brak trajektorii pobrania')
    expect(validateAs(code)).toEqual([])
  })

  it('przekładka co N warstw z wywołaniem podprogramu', () => {
    const p = sample(1)
    p.slipSheet = { enabled: true, thickness: 4, every: 3, callProgram: 'przekladka' }
    expect(layerZOffset(p, 3)).toBe(200)
    expect(layerZOffset(p, 4)).toBe(304)
    expect(layerZOffset(p, 7)).toBe(608)
    const code = renderAs(p)
    expect(code).toContain('.z_offset = (.j-1)*.wyswarstwy+INT((.j-1)/3)*.grubprzekl')
    expect(code).toContain('IF .j>1 AND ((.j-1) MOD 3)==0 THEN\n      CALL przekladka\n    END')
    expect(validateAs(code)).toEqual([])
  })
})

describe('formatowanie', () => {
  it('liczby bez zbędnych zer', () => {
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(0.5)).toBe('0.5')
    expect(formatNumber(-0)).toBe('0')
    expect(formatNumber(1 / 3)).toBe('0.333')
  })

  it('transliteracja polskich znaków', () => {
    expect(toAscii('Zażółć gęślą jaźń')).toBe('Zazolc gesla jazn')
  })
})

describe('walidator AS', () => {
  it('poprawny fragment', () => {
    expect(validateAs('FOR x=1 TO 2\nEND')).toEqual([])
  })

  it('niezamknięte i nadmiarowe bloki', () => {
    expect(validateAs('FOR .j = 1 TO 2\nIF .j==1 THEN\nEND')).toEqual([{ severity: 'error', message: 'FOR bez END', line: 1 }])
    expect(validateAs('END')).toEqual([{ severity: 'error', message: 'END bez bloku', line: 1 }])
    expect(validateAs('ELSE')[0].message).toBe('ELSE poza blokiem IF')
  })

  it('błędny SIGNAL', () => {
    expect(validateAs('SIGNAL')).toEqual([{ severity: 'error', message: 'Błędny SIGNAL', line: 1 }])
    expect(validateAs('SIGNAL abc')[0].message).toBe('Błędny SIGNAL')
    expect(validateAs('SIGNAL 12,-13\nSIGNAL -2001')).toEqual([])
  })

  it('struktura programu', () => {
    expect(validateAs('.PROGRAM test()\n  JMOVE p1\n.END\n')).toEqual([])
    expect(validateAs('.PROGRAM test()\n  JMOVE p1\n').map((i) => i.message)).toContain('Brak .END')
    expect(validateAs('  JMOVE p1\n.END').map((i) => i.message)).toContain('Brak .PROGRAM')
    expect(validateAs('.PROGRAM 1test()\n.END')[0].message).toBe('Błędny nagłówek .PROGRAM')
  })

  it('ostrzega o znakach spoza ASCII', () => {
    expect(validateAs('; komentarz z ż')[0].severity).toBe('warning')
  })
})
