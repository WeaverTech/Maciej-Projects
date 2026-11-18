import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AsExportError, renderAs } from '../../src/core/asExport'
import { projectCycles } from '../../src/core/gripper'
import { compareAB } from '../../src/core/layers'
import { parseProject } from '../../src/core/projectIo'
import { validateGeometry } from '../../src/core/validation'

/**
 * Pliki wzorcowe wygenerowane rdzeniem Kawasaki Palletizer 2.3 (Python) – patrz
 * tests/fixtures/legacy/gen_fixtures.py. Chronią zgodność transformacji, walidacji i kodu AS.
 */
interface Fixture {
  project: unknown
  as?: string
  as_error?: string
  validation: Record<string, [string, string, number[]][]>
  compare_ab: [string, string][]
  cycles: [number, number][][]
  cycle_errors: string[]
}

const load = (name: string): Fixture =>
  JSON.parse(readFileSync(join(__dirname, '../fixtures/legacy', `${name}.json`), 'utf-8')) as Fixture

const severity = { Błąd: 'error', Ostrzeżenie: 'warning', Informacja: 'info' } as const

const names = ['single_a', 'single_ab', 'double_ab', 'box_corner_b', 'bag_limits', 'double_bad_cycles', 'bad_axes']

describe.each(names)('zgodność z wersją 2.3: %s', (name) => {
  const fixture = load(name)
  const project = parseProject(fixture.project)

  it('kod AS', () => {
    if (fixture.as !== undefined) {
      const expected = fixture.as.replaceAll('-0.000', '0.000')
      expect(renderAs(project, { header: false })).toBe(expected)
    } else {
      expect(() => renderAs(project)).toThrow(AsExportError)
    }
  })

  it('walidacja geometrii', () => {
    for (const [layer, expected] of Object.entries(fixture.validation)) {
      const actual = validateGeometry(project, layer as 'A' | 'B')
        .map((i) => `${i.severity}:${[...(i.itemIds ?? [])].sort().join(',')}`)
        .sort()
      // W wersji 2.3 błąd osi był zgłaszany razem z geometrią; teraz jest osobnym problemem projektu.
      const wanted = expected
        .filter(([, , ids]) => ids.length > 0)
        .map(([sev, , ids]) => `${severity[sev as keyof typeof severity]}:${[...ids].sort().join(',')}`).sort()
      expect(actual).toEqual(wanted)
    }
  })

  it('cykle chwytaka', () => {
    const result = projectCycles(project)
    expect(result.cycles.map((c) => c.map((e) => [e.product, e.section]))).toEqual(fixture.cycles)
    expect(result.errors).toEqual(fixture.cycle_errors)
  })

  it('porównanie A/B', () => {
    const result = compareAB(project).map((r) => [r.severity, r.message])
    expect(result).toEqual(fixture.compare_ab.map(([sev, msg]) => [severity[sev as keyof typeof severity], msg]))
  })
})
