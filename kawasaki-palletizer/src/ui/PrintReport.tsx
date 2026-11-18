import { APP_NAME, APP_VERSION } from '../core/defaults'
import { formatMm, formatPercent } from '../core/format'
import { axesValid, CORNER_LABELS, DIRECTION_LABELS, orientationO, toBase } from '../core/geometry'
import { projectCycles, sectionSignals } from '../core/gripper'
import { layerSequence, sortedByOrder } from '../core/layers'
import type { LayerName, Project } from '../core/types'
import { useState } from 'react'
import { useStore } from '../state/store'
import { useIssues, useStats } from './hooks'
import { LayerThumb } from './LayerThumb'

function PointsTable({ project, name }: { project: Project; name: LayerName }) {
  const layer = name === 'B' ? project.layers.B : project.layers.A
  if (!layer) return null
  const valid = axesValid(project.pallet)
  return (
    <table className="w-full border-collapse text-[10.5px] tabular-nums">
      <thead>
        <tr className="border-b border-black/40 text-left">
          <th className="py-1 pr-2">Nr</th>
          <th className="py-1 pr-2 text-right">X BASE</th>
          <th className="py-1 pr-2 text-right">Y BASE</th>
          <th className="py-1 text-right">O [°]</th>
        </tr>
      </thead>
      <tbody>
        {sortedByOrder(layer.items).map((item) => {
          const b = valid ? toBase(item.x, item.y, project.pallet) : null
          return (
            <tr key={item.id} className="border-b border-black/10">
              <td className="py-0.5 pr-2 font-semibold">{item.order}</td>
              <td className="py-0.5 pr-2 text-right">{b ? formatMm(b.x) : '—'}</td>
              <td className="py-0.5 pr-2 text-right">{b ? formatMm(b.y) : '—'}</td>
              <td className="py-0.5 text-right">{valid ? formatMm(orientationO(item.rotation, project)) : '—'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** Karta paletyzacji – widoczna wyłącznie na wydruku (Plik → Drukuj). */
export function PrintReport() {
  const project = useStore((s) => s.project)
  const stats = useStats()
  const { errors, warnings } = useIssues()
  const [printedOn] = useState(() => new Date().toLocaleDateString('pl-PL'))
  const { pallet, product, robot } = project
  const sequence = layerSequence(project)
  const cycles = projectCycles(project).cycles
  const rows: [string, string][] = [
    ['Paleta', `${formatMm(pallet.length)} × ${formatMm(pallet.width)} mm`],
    ['BASE', `narożnik ${pallet.baseCorner} (${CORNER_LABELS[pallet.baseCorner]}), +X ${DIRECTION_LABELS[pallet.xDirection]}, +Y ${DIRECTION_LABELS[pallet.yDirection]}`],
    ['Produkt', `${product.kind} ${formatMm(product.length)} × ${formatMm(product.width)} × ${formatMm(product.height)} mm`],
    ['Przyrost warstwy', `${formatMm(product.layerIncrement)} mm`],
    ['Warstwy', `${stats.layers} (${sequence.join(' ')})`],
    ['Produkty', `${stats.totalProducts} szt. (${stats.perLayerA} / warstwę A${project.layers.B ? `, ${stats.perLayerB} / warstwę B` : ''})`],
    ['Wysokość ładunku', `${formatMm(stats.stackHeight, 0)} mm${stats.slipSheets ? ` z ${stats.slipSheets} przekładkami` : ''}`],
    ['Wypełnienie warstwy A', formatPercent(stats.fill)],
    ['Chwyt', robot.pickMode === 'podwojny' ? `podwójny – ${cycles.length} cykli / warstwę` : `pojedynczy – ${cycles.length} cykli / warstwę`],
    ['Sygnały', `${robot.s1Name}: ${sectionSignals(robot, 1).on} / ${sectionSignals(robot, 1).off}${robot.pickMode === 'podwojny' ? `; ${robot.s2Name}: ${sectionSignals(robot, 2).on} / ${sectionSignals(robot, 2).off}` : ''}`],
    ['Program', `${robot.programName} · BASE ${robot.baseName} · SPEED ${robot.speed} · Z pierwszej warstwy ${formatMm(robot.firstZ)} · Z bezpieczne ${formatMm(robot.safeZ)}`],
    ['Walidacja', errors ? `BŁĘDY: ${errors}, ostrzeżenia: ${warnings}` : warnings ? `ostrzeżenia: ${warnings}` : 'bez zastrzeżeń'],
  ]

  return (
    <div className="hidden bg-white p-0 font-sans text-[11.5px] text-black print:block" data-testid="print-report">
      <header className="flex items-end justify-between border-b-2 border-black pb-2">
        <div>
          <p className="text-[10px] tracking-[0.12em] uppercase">Karta paletyzacji</p>
          <h1 className="text-[20px] leading-tight font-bold">{project.name || 'Projekt bez nazwy'}</h1>
        </div>
        <p className="text-right text-[10px]">
          {APP_NAME} {APP_VERSION}
          <br />
          {printedOn}
        </p>
      </header>

      <table className="mt-3 w-full border-collapse">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-black/10 align-top">
              <th className="w-44 py-1 pr-3 text-left font-semibold">{label}</th>
              <td className="py-1">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 grid grid-cols-2 gap-6">
        {(['A', 'B'] as const).map((name) => {
          const layer = name === 'B' ? project.layers.B : project.layers.A
          if (!layer) return null
          return (
            <section key={name} className="break-inside-avoid">
              <h2 className="mb-1.5 text-[13px] font-bold">
                Warstwa {name}
                {name === 'B' && layer.link === 'rot180' ? ' (A obrócona o 180°)' : ''}
              </h2>
              <LayerThumb pallet={pallet} product={product} items={layer.items} width={330} height={250} layer={name} />
              <div className="mt-2">
                <PointsTable project={project} name={name} />
              </div>
            </section>
          )
        })}
      </div>

      <p className="mt-5 border-t border-black/30 pt-2 text-[10px] leading-snug">
        Współrzędne podano w układzie BASE robota [mm]. Kod AS jest szablonem stanowiskowym – przed uruchomieniem należy zweryfikować BASE, TCP,
        orientację, sygnały, limity osi i trajektorie.
      </p>
    </div>
  )
}
