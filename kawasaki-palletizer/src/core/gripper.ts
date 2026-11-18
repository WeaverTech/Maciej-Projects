import { sortedByOrder } from './layers'
import type { Project, Robot } from './types'

export type Section = 1 | 2

export interface CycleEntry {
  product: number
  section: Section
}

export type Cycle = CycleEntry[]

export interface CyclesResult {
  cycles: Cycle[]
  errors: string[]
}

/**
 * Parsuje konfigurację cykli chwytu podwójnego, np. `1=1,2=2;3=1,4=2`.
 * Każdy cykl (oddzielony średnikiem) to jedno pobranie; każdy produkt musi mieć inną sekcję.
 */
export function parseCycles(raw: string, orders: number[]): CyclesResult {
  if (!raw.trim()) return { cycles: [], errors: ['Brak konfiguracji cykli'] }
  const valid = new Set(orders)
  const seen = new Map<number, number>()
  const cycles: Cycle[] = []
  const errors: string[] = []
  raw.split(';').forEach((part, idx) => {
    const ci = idx + 1
    if (!part.trim()) return
    const cycle: Cycle = []
    const sections = new Set<number>()
    for (const tokenRaw of part.split(',')) {
      const token = tokenRaw.trim()
      if (!token) continue
      if (!token.includes('=')) {
        errors.push(`Cykl ${ci}: wymagany format produkt=sekcja`)
        continue
      }
      const eq = token.indexOf('=')
      const a = token.slice(0, eq).trim()
      const b = token.slice(eq + 1).trim()
      if (!/^\d+$/.test(a) || !/^\d+$/.test(b)) {
        errors.push(`Cykl ${ci}: błędne '${token}'`)
        continue
      }
      const product = Number(a)
      const section = Number(b)
      if (!valid.has(product)) {
        errors.push(`Produkt ${product} nie istnieje`)
        continue
      }
      if (section !== 1 && section !== 2) {
        errors.push(`Sekcja ${section} nie istnieje`)
        continue
      }
      if (seen.has(product)) {
        errors.push(`Produkt ${product} występuje ponownie`)
        continue
      }
      if (sections.has(section)) {
        errors.push(`Cykl ${ci}: sekcja ${section} użyta dwa razy`)
        continue
      }
      seen.set(product, ci)
      sections.add(section)
      cycle.push({ product, section })
    }
    if (cycle.length) cycles.push(cycle)
  })
  const missing = [...valid].filter((o) => !seen.has(o)).sort((x, y) => x - y)
  if (missing.length) errors.push('Nieprzypisane produkty: ' + missing.join(', '))
  return { cycles, errors }
}

export function formatCycles(cycles: Cycle[]): string {
  return cycles
    .filter((c) => c.length > 0)
    .map((c) => c.map((e) => `${e.product}=${e.section}`).join(','))
    .join(';')
}

/** Paruje produkty kolejno: (1,2), (3,4)… Nieparzysty ostatni produkt jedzie sam na sekcji 1. */
export function autoPairCycles(orders: number[]): Cycle[] {
  const sorted = [...orders].sort((a, b) => a - b)
  const cycles: Cycle[] = []
  for (let i = 0; i < sorted.length; i += 2) {
    const cycle: Cycle = [{ product: sorted[i], section: 1 }]
    if (i + 1 < sorted.length) cycle.push({ product: sorted[i + 1], section: 2 })
    cycles.push(cycle)
  }
  return cycles
}

/** Cykle pobrań projektu: w trybie pojedynczym każdy produkt osobno na sekcji 1. */
export function projectCycles(project: Pick<Project, 'layers' | 'robot'>): CyclesResult {
  const orders = sortedByOrder(project.layers.A.items).map((i) => i.order)
  if (project.robot.pickMode === 'pojedynczy') {
    return { cycles: orders.map((o) => [{ product: o, section: 1 as Section }]), errors: [] }
  }
  return parseCycles(project.robot.assignments, orders)
}

/** Mapa produkt → sekcja dla podglądu w edytorze. */
export function sectionByProduct(project: Pick<Project, 'layers' | 'robot'>): Map<number, { section: Section; cycle: number }> {
  const { cycles } = projectCycles(project)
  const map = new Map<number, { section: Section; cycle: number }>()
  cycles.forEach((c, idx) => c.forEach((e) => map.set(e.product, { section: e.section, cycle: idx + 1 })))
  return map
}

/** Pole sygnału jest argumentem instrukcji SIGNAL, np. `12,-13`. */
export function parseSignal(raw: string): { ok: boolean; values: number[]; error?: string } {
  const text = raw.trim()
  if (!text) return { ok: false, values: [], error: 'brak sygnału' }
  const values: number[] = []
  for (const token of text.split(',')) {
    const t = token.trim()
    if (!/^[-+]?\d+$/.test(t) || Number(t) === 0) {
      return { ok: false, values: [], error: `nieprawidłowy numer sygnału „${t}”` }
    }
    values.push(Number(t))
  }
  return { ok: true, values }
}

export function sectionSignals(robot: Robot, section: Section): { on: string; off: string; name: string } {
  return section === 1
    ? { on: robot.s1On, off: robot.s1Off, name: robot.s1Name }
    : { on: robot.s2On, off: robot.s2Off, name: robot.s2Name }
}
