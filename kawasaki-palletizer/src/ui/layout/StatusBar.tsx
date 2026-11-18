import { AlertTriangle, CircleCheck, CircleX, Ruler } from 'lucide-react'
import { APP_VERSION } from '../../core/defaults'
import { errorsLabel, formatMm, productsLabel, warningsLabel } from '../../core/format'
import { axesValid, toBase } from '../../core/geometry'
import { getLayer } from '../../core/layers'
import { useCursor } from '../../state/cursor'
import { useStore } from '../../state/store'
import { useIssues, useStats } from '../hooks'
import { cx } from '../kit'

function Sep() {
  return <span className="h-3.5 w-px bg-line" />
}

export function StatusBar() {
  const project = useStore((s) => s.project)
  const activeLayer = useStore((s) => s.activeLayer)
  const selection = useStore((s) => s.selection.length)
  const view = useStore((s) => s.view)
  const store = useStore.getState()
  const cursor = useCursor()
  const { errors, warnings } = useIssues()
  const stats = useStats()

  const count = getLayer(project, activeLayer).items.length
  const hasCursor = view === 'layout' && cursor.x !== null && cursor.y !== null
  const base = hasCursor && axesValid(project.pallet) ? toBase(cursor.x!, cursor.y!, project.pallet) : null

  return (
    <footer
      className="no-print flex h-8 shrink-0 items-center gap-3 border-t border-line bg-panel px-3.5 text-[11.5px] text-muted tabular-nums"
      data-testid="status-bar"
    >
      <span className="flex items-center gap-1.5 font-medium text-fg">
        <span className="size-2 rounded-[3px]" style={{ background: activeLayer === 'A' ? 'var(--item-a-edge)' : 'var(--item-b-edge)' }} />
        Warstwa {activeLayer}
      </span>
      <span data-testid="status-count">{productsLabel(count)}</span>
      {selection > 0 && (
        <>
          <Sep />
          <span data-testid="status-selection">zaznaczono: {selection}</span>
        </>
      )}
      <Sep />
      <span>
        Stos: {stats.totalProducts} szt. · {stats.layers} warstw · {formatMm(stats.stackHeight, 0)} mm
      </span>

      <div className="flex-1" />

      {view === 'layout' && cursor.measure && (
        <span className="flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text" data-testid="status-measure">
          <Ruler size={12} />
          {formatMm(cursor.measure.length)} mm
          <span className="font-normal opacity-80">
            (ΔX {formatMm(Math.abs(cursor.measure.dx))} · ΔY {formatMm(Math.abs(cursor.measure.dy))})
          </span>
        </span>
      )}
      {hasCursor && (
        <span data-testid="status-cursor">
          Plansza <span className="text-fg">X {formatMm(cursor.x!, 0)}</span> <span className="text-fg">Y {formatMm(cursor.y!, 0)}</span>
          {base && (
            <>
              <span className="mx-1.5 text-subtle">→</span>
              BASE <span style={{ color: 'var(--axis-x)' }}>X {formatMm(base.x, 0)}</span>{' '}
              <span style={{ color: 'var(--axis-y)' }}>Y {formatMm(base.y, 0)}</span>
            </>
          )}
        </span>
      )}
      {view === 'layout' && (
        <>
          <Sep />
          <span data-testid="status-zoom">{Math.round(cursor.zoom * 100)}%</span>
        </>
      )}
      <Sep />
      <button
        type="button"
        data-testid="status-issues"
        onClick={() => store.setRightTab('validation')}
        className={cx(
          'flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-medium transition-colors hover:bg-hover',
          errors > 0 ? 'text-danger' : warnings > 0 ? 'text-warning' : 'text-success',
        )}
      >
        {errors > 0 ? <CircleX size={13} /> : warnings > 0 ? <AlertTriangle size={13} /> : <CircleCheck size={13} />}
        {errors > 0
          ? `${errorsLabel(errors)}${warnings > 0 ? ` · ${warningsLabel(warnings)}` : ''}`
          : warnings > 0
            ? warningsLabel(warnings)
            : 'Projekt poprawny'}
      </button>
      <Sep />
      <span className="text-subtle">v{APP_VERSION}</span>
    </footer>
  )
}
