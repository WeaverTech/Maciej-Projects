import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import { createExampleProject } from '../../src/core/example'
import { parseProject, parseProjectJson, ProjectFormatError, serializeProject, suggestedFileName } from '../../src/core/projectIo'

const legacy = (name: string) =>
  (JSON.parse(readFileSync(join(__dirname, '../fixtures/legacy', `${name}.json`), 'utf-8')) as { project: unknown }).project

describe('zapis i odczyt projektu', () => {
  it('zapis → odczyt zwraca identyczny projekt', () => {
    const project = createExampleProject()
    project.slipSheet = { enabled: true, thickness: 4, every: 2, callProgram: 'przekladka' }
    project.robot.pickMode = 'podwojny'
    expect(parseProjectJson(serializeProject(project))).toEqual(project)
  })

  it('zapis zawiera numer formatu', () => {
    const data = JSON.parse(serializeProject(createProject()))
    expect(data.version).toBe(4)
    expect(data.app).toBe('kawasaki-palletizer')
  })

  it('odrzuca nieprawidłowe pliki z czytelnym komunikatem', () => {
    expect(() => parseProjectJson('{ to nie json')).toThrow(ProjectFormatError)
    expect(() => parseProjectJson('[]')).toThrow('nie zawiera projektu')
    expect(() => parseProjectJson('{"pallet":{},"product":{},"layers":{}}')).toThrow('warstwy A')
    expect(() => parseProject({ version: 99, pallet: {}, product: {}, layers: { A: {} } })).toThrow('nowszej wersji')
  })

  it('uzupełnia brakujące pola wartościami domyślnymi', () => {
    const p = parseProject({ version: 4, pallet: { length: 1000 }, product: {}, layers: { A: { items: [{ x: 10, y: 20 }] } } })
    expect(p.pallet.length).toBe(1000)
    expect(p.pallet.width).toBe(800)
    expect(p.layers.A.items).toEqual([{ id: 1, x: 10, y: 20, rotation: 0, order: 1 }])
    expect(p.robot.programName).toBe('paletyzacja')
    expect(p.slipSheet.enabled).toBe(false)
  })
})

describe('migracja plików z wersji 2.x (format 3)', () => {
  it('przenosi pola snake_case', () => {
    const p = parseProject(legacy('box_corner_b'))
    expect(p.version).toBe(4)
    expect(p.pallet).toEqual({ length: 1200, width: 800, baseCorner: 'B', xDirection: 'lewo', yDirection: 'dol' })
    expect(p.product.kind).toBe('karton')
    expect(p.product.layerIncrement).toBe(250)
    expect(p.robot.programName).toBe('kartony')
    expect(p.robot.baseName).toBe('bazapal')
    expect(p.robot.firstZ).toBe(-250)
    expect(p.robot.safeZ).toBe(600)
    expect(p.robot.s1On).toBe('12,-13')
    expect(p.layers.A.items).toHaveLength(4)
    expect(p.layers.A.items[3]).toEqual({ id: 4, x: 450.5, y: 480.25, rotation: 90, order: 4 })
  })

  it('zachowuje dotychczasowy sposób liczenia kąta O, gdy osie nie są domyślne', () => {
    expect(parseProject(legacy('box_corner_b')).robot.orientationMode).toBe('legacy')
    expect(parseProject(legacy('single_a')).robot.orientationMode).toBe('base')
  })

  it('rozpoznaje warstwę B będącą obrotem A i wiąże ją z A', () => {
    const p = parseProject(legacy('double_ab'))
    expect(p.layers.B?.link).toBe('rot180')
    expect(p.robot.pickMode).toBe('podwojny')
  })

  it('zmodyfikowana ręcznie warstwa B pozostaje niezależna', () => {
    const raw = structuredClone(legacy('single_ab')) as { layers: { B: { items: { x: number }[] } } }
    raw.layers.B.items[0].x += 25
    const p = parseProject(raw)
    expect(p.layers.B?.link).toBeNull()
    expect(p.layers.B?.items[0].x).toBe(raw.layers.B.items[0].x)
  })
})

describe('nazwy plików', () => {
  it('usuwa polskie znaki i spacje', () => {
    expect(suggestedFileName({ name: 'Żółte worki – 25 kg' }, 'json')).toBe('Zolte_worki_25_kg.json')
    expect(suggestedFileName({ name: '   ' }, 'as')).toBe('projekt.as')
  })
})
