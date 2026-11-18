import { exportBlockers, renderAs } from './asExport'
import { validateAs } from './asValidator'
import { axesValid, EPS, overhang, overlapDepth, placementRect } from './geometry'
import { parseSignal, projectCycles } from './gripper'
import { compareAB, layerNames, sortedByOrder } from './layers'
import type { Issue, LayerName, Project } from './types'

const fmt = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '')

/** Wystawanie poza paletę i nakładanie produktów w jednej warstwie. */
export function validateGeometry(project: Project, layer: LayerName): Issue[] {
  const out: Issue[] = []
  const items = sortedByOrder((layer === 'B' ? project.layers.B : project.layers.A)?.items ?? [])
  const { product, pallet } = project
  const bag = product.kind === 'worek'
  const rects = items.map((i) => placementRect(i, product))

  items.forEach((item, idx) => {
    const over = overhang(rects[idx], pallet)
    if (over > EPS) {
      const allowed = bag && product.allowOverhang && over <= product.maxOverhang + EPS
      out.push({
        id: `overhang-${layer}-${item.id}`,
        severity: allowed ? 'warning' : 'error',
        scope: 'geometry',
        layer,
        itemIds: [item.id],
        message: allowed
          ? `Produkt ${item.order} wystaje poza paletę o ${fmt(over)} mm (w limicie ${fmt(product.maxOverhang)} mm)`
          : `Produkt ${item.order} wystaje poza paletę o ${fmt(over)} mm`,
      })
    }
  })

  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      const depth = overlapDepth(rects[a], rects[b])
      if (depth > EPS) {
        const allowed = bag && product.allowOverlap && depth <= product.maxOverlap + EPS
        out.push({
          id: `overlap-${layer}-${items[a].id}-${items[b].id}`,
          severity: allowed ? 'warning' : 'error',
          scope: 'geometry',
          layer,
          itemIds: [items[a].id, items[b].id],
          message: allowed
            ? `Produkty ${items[a].order} i ${items[b].order} nakładają się na ${fmt(depth)} mm (w limicie ${fmt(product.maxOverlap)} mm)`
            : `Produkty ${items[a].order} i ${items[b].order} nakładają się na ${fmt(depth)} mm`,
        })
      }
    }
  }
  return out
}

/** Numeracja produktów w warstwie musi być ciągła: 1..n bez powtórzeń. */
export function validateOrder(project: Project, layer: LayerName): Issue[] {
  const items = (layer === 'B' ? project.layers.B : project.layers.A)?.items ?? []
  if (items.length === 0) return []
  const out: Issue[] = []
  const counts = new Map<number, number[]>()
  for (const it of items) counts.set(it.order, [...(counts.get(it.order) ?? []), it.id])
  const duplicates = [...counts.entries()].filter(([, ids]) => ids.length > 1)
  for (const [order, ids] of duplicates) {
    out.push({
      id: `order-dup-${layer}-${order}`,
      severity: 'error',
      scope: 'order',
      layer,
      itemIds: ids,
      message: `Warstwa ${layer}: numer ${order} jest użyty ${ids.length} razy`,
      fix: 'renumber',
    })
  }
  const missing: number[] = []
  for (let n = 1; n <= items.length; n++) if (!counts.has(n)) missing.push(n)
  const invalid = items.filter((i) => !Number.isInteger(i.order) || i.order < 1 || i.order > items.length)
  if (duplicates.length === 0 && (missing.length || invalid.length)) {
    out.push({
      id: `order-gap-${layer}`,
      severity: 'error',
      scope: 'order',
      layer,
      itemIds: invalid.map((i) => i.id),
      message: `Warstwa ${layer}: nieciągła kolejność produktów (brak numerów: ${missing.join(', ')})`,
      fix: 'renumber',
    })
  }
  return out
}

const AS_NAME = /^[A-Za-z][A-Za-z0-9_.]*$/

function validateName(value: string, label: string, id: string): Issue[] {
  const v = value.trim()
  if (!v) return [{ id: `name-empty-${id}`, severity: 'error', scope: 'robot', message: `${label}: nazwa jest pusta` }]
  if (!AS_NAME.test(v)) {
    return [
      {
        id: `name-invalid-${id}`,
        severity: 'error',
        scope: 'robot',
        message: `${label}: nazwa „${v}” musi zaczynać się od litery i zawierać tylko litery, cyfry, „_” i „.”`,
      },
    ]
  }
  if (v.length > 15) {
    return [
      {
        id: `name-long-${id}`,
        severity: 'warning',
        scope: 'robot',
        message: `${label}: nazwa „${v}” ma ponad 15 znaków – sprawdź limit kontrolera`,
      },
    ]
  }
  return []
}

function validateRobot(project: Project): Issue[] {
  const R = project.robot
  const out: Issue[] = [
    ...validateName(R.programName, 'Program', 'program'),
    ...validateName(R.baseName, 'Punkt BASE', 'base'),
    ...validateName(R.pickup, 'Punkt pobrania', 'pickup'),
    ...validateName(R.pickupApproach, 'Punkt najazdu', 'approach'),
  ]
  if (project.slipSheet.enabled && project.slipSheet.callProgram.trim()) {
    out.push(...validateName(project.slipSheet.callProgram, 'Podprogram przekładki', 'slip'))
  }
  if (!Number.isInteger(R.layers) || R.layers < 1) {
    out.push({ id: 'layers-count', severity: 'error', scope: 'robot', message: 'Liczba warstw musi być liczbą całkowitą ≥ 1' })
  }
  if (!(project.product.layerIncrement > 0)) {
    out.push({ id: 'layer-increment', severity: 'error', scope: 'robot', message: 'Przyrost warstwy musi być większy od zera' })
  }
  for (const [key, label] of [
    ['speed', 'SPEED'],
    ['accel', 'ACCEL'],
    ['decel', 'DECEL'],
  ] as const) {
    const v = R[key]
    if (!(v > 0) || v > 100) {
      out.push({ id: `motion-${key}`, severity: 'error', scope: 'robot', message: `${label} musi być w zakresie 0–100 %` })
    }
  }
  if (R.gripWait < 0 || R.releaseWait < 0) {
    out.push({ id: 'waits', severity: 'error', scope: 'robot', message: 'Czasy oczekiwania chwytaka nie mogą być ujemne' })
  }
  if (project.slipSheet.enabled && !(project.slipSheet.thickness > 0)) {
    out.push({ id: 'slip-thickness', severity: 'warning', scope: 'robot', message: 'Przekładka ma zerową grubość i nie wpływa na wysokość' })
  }
  return out
}

function validateGripper(project: Project): Issue[] {
  const R = project.robot
  const out: Issue[] = []
  const double = R.pickMode === 'podwojny'
  const sections = double ? ([1, 2] as const) : ([1] as const)
  for (const s of sections) {
    for (const [value, what] of [
      [s === 1 ? R.s1On : R.s2On, 'ON'],
      [s === 1 ? R.s1Off : R.s2Off, 'OFF'],
    ] as const) {
      const parsed = parseSignal(value)
      if (!parsed.ok) {
        out.push({
          id: `signal-${s}-${what}`,
          severity: 'error',
          scope: 'gripper',
          message: `Sekcja ${s} ${what}: ${parsed.error}`,
        })
      }
    }
  }
  if (double && project.layers.A.items.length > 0) {
    const { errors } = projectCycles(project)
    errors.forEach((message, idx) => {
      out.push({ id: `cycle-${idx}`, severity: 'error', scope: 'gripper', message: `Cykle chwytaka: ${message}`, fix: 'auto-pair' })
    })
  }
  return out
}

function validateLayers(project: Project): Issue[] {
  const out: Issue[] = []
  const b = project.layers.B
  if (project.layers.A.items.length === 0) {
    out.push({ id: 'empty-A', severity: 'error', scope: 'layers', layer: 'A', message: 'Warstwa A nie zawiera produktów' })
  }
  if (!b || project.layers.A.items.length === 0) return out
  if (b.items.length === 0) {
    out.push({ id: 'empty-B', severity: 'error', scope: 'layers', layer: 'B', message: 'Warstwa B nie zawiera produktów' })
    return out
  }
  if (b.link === 'rot180') return out
  for (const res of compareAB(project)) {
    if (res.severity !== 'error') continue
    const ids = b.items.filter((i) => i.order === res.order).map((i) => i.id)
    out.push({
      id: `ab-missing-${res.order}`,
      severity: 'error',
      scope: 'layers',
      layer: ids.length ? 'B' : 'A',
      itemIds: ids.length ? ids : project.layers.A.items.filter((i) => i.order === res.order).map((i) => i.id),
      message: `Niespójność A/B: ${res.message.charAt(0).toLowerCase()}${res.message.slice(1)}`,
      fix: 'relink-b',
    })
  }
  return out
}

function validateDimensions(project: Project): Issue[] {
  const out: Issue[] = []
  const { pallet, product } = project
  if (!(pallet.length > 0) || !(pallet.width > 0)) {
    out.push({ id: 'pallet-dims', severity: 'error', scope: 'geometry', message: 'Wymiary palety muszą być większe od zera' })
  }
  if (!(product.length > 0) || !(product.width > 0) || !(product.height > 0)) {
    out.push({ id: 'product-dims', severity: 'error', scope: 'geometry', message: 'Wymiary produktu muszą być większe od zera' })
  }
  return out
}

/** Pełna walidacja projektu. Wynik jest posortowany: błędy, ostrzeżenia, informacje. */
export function validateProject(project: Project): Issue[] {
  const issues: Issue[] = [...validateDimensions(project)]
  if (!axesValid(project.pallet)) {
    issues.push({ id: 'axes', severity: 'error', scope: 'axes', message: 'Osie +X i +Y nie są prostopadłe' })
  }
  issues.push(...validateLayers(project))
  for (const name of layerNames(project)) {
    const layerIssues = [...validateOrder(project, name), ...validateGeometry(project, name)]
    // Powiązana warstwa B jest lustrzanym odbiciem A, więc jej problemy są tymi samymi problemami.
    const mirrored = name === 'B' && project.layers.B?.link === 'rot180'
    issues.push(...(mirrored ? layerIssues.map((i) => ({ ...i, mirrored: true })) : layerIssues))
  }
  issues.push(...validateGripper(project))
  issues.push(...validateRobot(project))

  // Strukturę kodu sprawdzamy dopiero, gdy konfiguracja pozwala wygenerować sensowny program.
  const configBroken = issues.some((i) => i.severity === 'error' && i.scope !== 'geometry')
  if (!configBroken && exportBlockers(project).length === 0) {
    try {
      for (const problem of validateAs(renderAs(project))) {
        if (problem.severity === 'info') continue
        issues.push({
          id: `as-${problem.line}-${problem.message}`,
          severity: problem.severity,
          scope: 'as',
          message: `Kod AS, linia ${problem.line}: ${problem.message}`,
        })
      }
    } catch (error) {
      issues.push({ id: 'as-render', severity: 'error', scope: 'as', message: `Kod AS: ${(error as Error).message}` })
    }
  }

  const rank = { error: 0, warning: 1, info: 2 } as const
  return issues.sort((a, b) => rank[a.severity] - rank[b.severity])
}

export function countIssues(issues: Issue[]): { errors: number; warnings: number } {
  let errors = 0
  let warnings = 0
  for (const i of issues) {
    if (i.mirrored) continue
    if (i.severity === 'error') errors++
    else if (i.severity === 'warning') warnings++
  }
  return { errors, warnings }
}

/** Identyfikatory produktów z problemami w danej warstwie (do kolorowania w edytorze). */
export function issueItemSets(issues: Issue[], layer: LayerName): { errors: Set<number>; warnings: Set<number> } {
  const errors = new Set<number>()
  const warnings = new Set<number>()
  for (const issue of issues) {
    if (issue.layer !== layer || !issue.itemIds) continue
    const target = issue.severity === 'error' ? errors : issue.severity === 'warning' ? warnings : null
    if (target) for (const id of issue.itemIds) target.add(id)
  }
  for (const id of errors) warnings.delete(id)
  return { errors, warnings }
}
