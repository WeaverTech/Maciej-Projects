import { APP_NAME, APP_VERSION } from './defaults'
import { axesValid, orientationO, toBase } from './geometry'
import { projectCycles, sectionSignals } from './gripper'
import { sortedByOrder } from './layers'
import type { Placement, Project } from './types'

export class AsExportError extends Error {
  readonly problems: string[]
  constructor(problems: string[]) {
    super(problems.join('\n'))
    this.name = 'AsExportError'
    this.problems = problems
  }
}

export interface AsExportOptions {
  /** Nagłówek z komentarzami (nazwa projektu, ostrzeżenie). Domyślnie włączony. */
  header?: boolean
  /** Data wstawiana do nagłówka; pominięta = brak daty (deterministyczny wynik). */
  date?: Date
}

/** Liczba w zapisie AS: bez zbędnych zer, maks. 3 miejsca po przecinku. */
export function formatNumber(v: number): string {
  if (!Number.isFinite(v)) return '0'
  const r = Math.round(v * 1000) / 1000
  return Object.is(r, -0) ? '0' : String(r)
}

function fixed3(v: number): string {
  const s = v.toFixed(3)
  return s === '-0.000' ? '0.000' : s
}

const TRANSLIT: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z',
}

/** Komentarze AS tylko w ASCII – kontrolery nie zawsze obsługują polskie znaki. */
export function toAscii(text: string): string {
  return text
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (c) => TRANSLIT[c] ?? c)
    .replace(/[^\x20-\x7e]/g, '?')
}

export function pointExpression(item: Placement, project: Project): string {
  const b = toBase(item.x, item.y, project.pallet)
  const o = orientationO(item.rotation, project)
  return `${project.robot.baseName}+TRANS(${fixed3(b.x)},${fixed3(b.y)},${fixed3(project.robot.firstZ)},${formatNumber(o)},0,0)`
}

/** Problemy uniemożliwiające wygenerowanie kodu. */
export function exportBlockers(project: Project): string[] {
  const problems: string[] = []
  if (project.layers.A.items.length === 0) problems.push('Warstwa A nie zawiera produktów')
  if (!axesValid(project.pallet)) problems.push('Osie X/Y muszą być prostopadłe')
  if (project.layers.A.items.length > 0) problems.push(...projectCycles(project).errors)
  return problems
}

/**
 * Generuje program Kawasaki AS.
 *
 * Kod jest szablonem stanowiskowym: przed uruchomieniem na robocie wymaga weryfikacji BASE, TCP,
 * orientacji, sygnałów, limitów i trajektorii.
 */
export function renderAs(project: Project, options: AsExportOptions = {}): string {
  const problems = exportBlockers(project)
  if (problems.length) throw new AsExportError(problems)

  const R = project.robot
  const { cycles } = projectCycles(project)
  const A = sortedByOrder(project.layers.A.items)
  const B = project.layers.B ? sortedByOrder(project.layers.B.items) : null
  const slip = project.slipSheet.enabled && project.slipSheet.thickness > 0 && R.layers > 1
  const every = Math.max(1, Math.floor(project.slipSheet.every))

  const lines: string[] = [`.PROGRAM ${R.programName}()`]

  if (options.header !== false) {
    lines.push(`; ${APP_NAME} ${APP_VERSION}`)
    lines.push(`; Projekt: ${toAscii(project.name)}`)
    if (options.date) lines.push(`; Data: ${options.date.toISOString().slice(0, 10)}`)
    lines.push(
      `; Paleta ${formatNumber(project.pallet.length)}x${formatNumber(project.pallet.width)} mm, BASE w narozniku ${project.pallet.baseCorner}, ` +
        `produkt ${formatNumber(project.product.length)}x${formatNumber(project.product.width)}x${formatNumber(project.product.height)} mm`,
    )
    lines.push('; UWAGA: szablon stanowiskowy. Przed uruchomieniem zweryfikuj BASE, TCP,')
    lines.push('; orientacje, sygnaly, limity osi i trajektorie.')
  }

  lines.push(
    `  SPEED ${formatNumber(R.speed)} ALWAYS`,
    `  ACCEL ${formatNumber(R.accel)} ALWAYS`,
    `  DECEL ${formatNumber(R.decel)} ALWAYS`,
    `  .wyswarstwy = ${formatNumber(project.product.layerIncrement)}`,
    `  .ilewarstw = ${formatNumber(R.layers)}`,
  )
  if (slip) lines.push(`  .grubprzekl = ${formatNumber(project.slipSheet.thickness)}`)

  lines.push('; WARSTWA A')
  for (const item of A) lines.push(`  POINT wa_cel[${item.order}] = ${pointExpression(item, project)}`)
  if (B) {
    lines.push('; WARSTWA B')
    for (const item of B) lines.push(`  POINT wb_cel[${item.order}] = ${pointExpression(item, project)}`)
  }

  lines.push('  FOR .j = 1 TO .ilewarstw')
  if (slip) {
    const count = every === 1 ? '(.j-1)' : `INT((.j-1)/${every})`
    lines.push(`    .z_offset = (.j-1)*.wyswarstwy+${count}*.grubprzekl`)
  } else {
    lines.push('    .z_offset = (.j-1)*.wyswarstwy')
  }
  lines.push(`    .z_safe = ${formatNumber(R.safeZ)}+.z_offset`)

  if (slip) {
    const callProgram = project.slipSheet.callProgram.trim()
    const where = every === 1 ? 'przed kazda kolejna warstwa' : `po kazdych ${every} warstwach`
    if (callProgram) {
      const condition = every === 1 ? '.j>1' : `.j>1 AND ((.j-1) MOD ${every})==0`
      lines.push(`; PRZEKLADKA ${where}`)
      lines.push(`    IF ${condition} THEN`, `      CALL ${callProgram}`, '    END')
    } else {
      lines.push(`; PRZEKLADKA ${where} - brak trajektorii pobrania, uzupelnij na stanowisku`)
    }
  }

  if (B) {
    lines.push('    IF (.j MOD 2)==1 THEN')
    for (const item of A) lines.push(`      POINT cel[${item.order}] = wa_cel[${item.order}]`)
    lines.push('    ELSE')
    for (const item of B) lines.push(`      POINT cel[${item.order}] = wb_cel[${item.order}]`)
    lines.push('    END')
  } else {
    for (const item of A) lines.push(`    POINT cel[${item.order}] = wa_cel[${item.order}]`)
  }

  cycles.forEach((cycle, idx) => {
    lines.push(`; CYKL ${idx + 1}`, `    JMOVE ${R.pickupApproach}`, `    LMOVE ${R.pickup}`)
    for (const entry of cycle) lines.push(`    SIGNAL ${sectionSignals(R, entry.section).on}`)
    lines.push(`    TWAIT ${formatNumber(R.gripWait)}`, `    LMOVE ${R.pickupApproach}`)
    for (const entry of cycle) {
      lines.push(
        `    JMOVE SHIFT(cel[${entry.product}] BY 0,0,.z_safe)`,
        `    LMOVE SHIFT(cel[${entry.product}] BY 0,0,.z_offset)`,
        `    SIGNAL ${sectionSignals(R, entry.section).off}`,
        `    TWAIT ${formatNumber(R.releaseWait)}`,
        `    LMOVE SHIFT(cel[${entry.product}] BY 0,0,.z_safe)`,
      )
    }
  })

  lines.push('  END', '.END', '')
  return lines.join('\n')
}

/** Przesunięcie Z warstwy nr `layerIndex` (1..n) względem pierwszej, z uwzględnieniem przekładek. */
export function layerZOffset(project: Pick<Project, 'product' | 'slipSheet'>, layerIndex: number): number {
  const j = Math.max(1, Math.floor(layerIndex))
  let z = (j - 1) * project.product.layerIncrement
  if (project.slipSheet.enabled && project.slipSheet.thickness > 0) {
    z += slipSheetsBelow(project, j) * project.slipSheet.thickness
  }
  return z
}

/** Liczba przekładek leżących pod warstwą nr `layerIndex`. */
export function slipSheetsBelow(project: Pick<Project, 'slipSheet'>, layerIndex: number): number {
  if (!project.slipSheet.enabled) return 0
  const every = Math.max(1, Math.floor(project.slipSheet.every))
  return Math.floor((Math.max(1, layerIndex) - 1) / every)
}
