import { AlertTriangle, CircleCheck, CircleX, ClipboardCopy, FileDown, ShieldAlert } from 'lucide-react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { exportBlockers, renderAs } from '../../core/asExport'
import { validateAs } from '../../core/asValidator'
import { cyclesLabel, errorsLabel, warningsLabel } from '../../core/format'
import { CORNER_LABELS, DIRECTION_LABELS, zAxisDirection } from '../../core/geometry'
import { copyAsCode, saveAsCode } from '../../state/actions'
import { useStore } from '../../state/store'
import { useIssues, useStats } from '../hooks'
import { cx } from '../cx'
import { Button, Callout } from '../kit'

const TOKEN =
  /(;.*$)|(\.PROGRAM\b|\.END\b|\b(?:FOR|TO|IF|THEN|ELSE|END|ALWAYS|MOD|AND|OR|BY|CALL)\b)|(\b(?:JMOVE|LMOVE|SPEED|ACCEL|DECEL|TWAIT|POINT|SHIFT|TRANS|INT)\b)|(\bSIGNAL\b)|(\.[a-z_][a-z0-9_]*)|((?<![A-Za-z_\]])-?\d+(?:\.\d+)?)/g

const TOKEN_COLORS = ['--code-comment', '--code-keyword', '--code-motion', '--code-signal', '--code-var', '--code-number']

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const index = m.index ?? 0
    if (index > last) out.push(line.slice(last, index))
    const group = m.slice(1).findIndex((g) => g !== undefined)
    out.push(
      <span key={index} style={{ color: `var(${TOKEN_COLORS[group]})`, fontStyle: group === 0 ? 'italic' : undefined, fontWeight: group === 1 || group === 3 ? 600 : undefined }}>
        {m[0]}
      </span>,
    )
    last = index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

const CHECKLIST = [
  'BASE i TCP odpowiadają rzeczywistemu stanowisku',
  'Kierunki osi X/Y/Z zgadzają się z układem robota',
  'Orientacja O chwytaka sprawdzona na pierwszym produkcie',
  'Numery sygnałów chwytaka zgodne ze schematem',
  'Punkty pobrania i dojazdu nauczone na robocie',
  'Wysokości Z i przejazdu bezpieczne dla całego stosu',
  'Pierwszy przebieg w trybie krokowym, z niską prędkością',
]

export function AsCodeView() {
  const project = useStore((s) => s.project)
  const store = useStore.getState()
  const { errors, warnings } = useIssues()
  const stats = useStats()
  const [checked, setChecked] = useState<boolean[]>(() => CHECKLIST.map(() => false))
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [today] = useState(() => new Date())

  const blockers = useMemo(() => exportBlockers(project), [project])
  const code = useMemo(() => (blockers.length ? null : renderAs(project, { date: today })), [project, blockers, today])
  const lines = useMemo(() => (code ? code.replace(/\n$/, '').split('\n') : []), [code])
  const asIssues = useMemo(() => (code ? validateAs(code).filter((i) => i.severity === 'error') : []), [code])
  const zDir = zAxisDirection(project.pallet)
  const done = checked.filter(Boolean).length

  const jumpTo = (line: number) => {
    setActiveLine(line)
    scrollRef.current?.querySelector(`[data-line="${line}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  if (!code) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-canvas p-8" data-testid="code-view">
        <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-pop" data-testid="code-blocked">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <ShieldAlert size={22} />
          </div>
          <h2 className="mt-3 text-[16px] font-semibold">Nie można jeszcze wygenerować kodu AS</h2>
          <p className="mt-1 text-[12.5px] text-muted">Popraw poniższe problemy – kod pojawi się automatycznie.</p>
          <ul className="mt-4 flex flex-col gap-1.5">
            {blockers.map((b) => (
              <li key={b} className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px]">
                <CircleX size={14} className="mt-0.5 shrink-0 text-danger" />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <Button variant="primary" onClick={() => store.setView('layout')}>
              Wróć do układu
            </Button>
            <Button
              onClick={() => {
                store.setView('layout')
                store.setRightTab('validation')
              }}
            >
              Pokaż walidację
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1" data-testid="code-view">
      <div className="flex min-w-0 flex-1 flex-col bg-inset">
        <div className="no-print flex h-12 shrink-0 items-center gap-2 border-b border-line bg-panel px-4">
          <span className="font-mono text-[12.5px] font-semibold">{project.robot.programName}.as</span>
          <span className="text-[12px] text-subtle">
            {lines.length} linii · {stats.perLayerA + stats.perLayerB} punktów · {cyclesLabel(stats.cyclesPerLayer)} na warstwę
          </span>
          <div className="flex-1" />
          <Button icon={<ClipboardCopy size={15} />} onClick={() => void copyAsCode()} data-testid="copy-as">
            Kopiuj
          </Button>
          <Button variant="primary" icon={<FileDown size={15} />} onClick={() => void saveAsCode()} data-testid="save-as">
            Zapisz .as
          </Button>
        </div>
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto py-3" data-testid="code-scroll">
          <pre className="min-w-max font-mono text-[12.5px] leading-[1.65]" data-testid="as-code">
            {lines.map((line, idx) => {
              const n = idx + 1
              const issue = asIssues.find((i) => i.line === n)
              return (
                <div
                  key={n}
                  data-line={n}
                  className={cx('flex pr-6', issue ? 'bg-danger-soft' : activeLine === n ? 'bg-accent-soft' : 'hover:bg-hover/60')}
                  title={issue?.message}
                >
                  <span className="sticky left-0 w-14 shrink-0 bg-inherit pr-4 text-right text-subtle select-none">{n}</span>
                  <code className="whitespace-pre">{highlight(line)}</code>
                </div>
              )
            })}
          </pre>
        </div>
      </div>

      <aside className="no-print flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-panel p-4">
        {errors > 0 ? (
          <Callout tone="danger" icon={<CircleX size={16} />}>
            <p className="font-semibold">Projekt zawiera {errorsLabel(errors)}</p>
            <p className="mt-0.5 text-muted">Kod został wygenerowany, ale nie powinien trafić na robota przed usunięciem błędów.</p>
            <button type="button" className="mt-1.5 font-medium text-accent-text hover:underline" onClick={() => { store.setView('layout'); store.setRightTab('validation') }}>
              Przejdź do walidacji →
            </button>
          </Callout>
        ) : warnings > 0 ? (
          <Callout tone="warning" icon={<AlertTriangle size={16} />}>
            <p className="font-semibold">{warningsLabel(warnings)} do sprawdzenia</p>
            <button type="button" className="mt-1 font-medium text-accent-text hover:underline" onClick={() => { store.setView('layout'); store.setRightTab('validation') }}>
              Przejdź do walidacji →
            </button>
          </Callout>
        ) : (
          <Callout tone="success" icon={<CircleCheck size={16} />}>
            <p className="font-semibold" data-testid="code-ok">Walidacja bez zastrzeżeń</p>
            <p className="mt-0.5 text-muted">Struktura programu (FOR/IF/END, SIGNAL) jest poprawna.</p>
          </Callout>
        )}

        {asIssues.length > 0 && (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Struktura kodu</h3>
            <ul className="flex flex-col gap-1">
              {asIssues.map((issue, idx) => (
                <li key={idx}>
                  <button type="button" onClick={() => jumpTo(issue.line)} className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] hover:bg-hover">
                    <span className="mt-px rounded bg-danger-soft px-1.5 font-mono text-[11px] font-semibold text-danger">{issue.line}</span>
                    {issue.message}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Założenia programu</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12.5px]">
            <dt className="text-muted">BASE</dt>
            <dd className="font-medium">
              narożnik {project.pallet.baseCorner} ({CORNER_LABELS[project.pallet.baseCorner]})
            </dd>
            <dt className="text-muted">Oś +X</dt>
            <dd className="font-medium" style={{ color: 'var(--axis-x)' }}>{DIRECTION_LABELS[project.pallet.xDirection]}</dd>
            <dt className="text-muted">Oś +Y</dt>
            <dd className="font-medium" style={{ color: 'var(--axis-y)' }}>{DIRECTION_LABELS[project.pallet.yDirection]}</dd>
            <dt className="text-muted">Oś +Z</dt>
            <dd className="font-medium" style={{ color: 'var(--axis-z)' }}>{zDir === 'up' ? 'w górę' : zDir === 'down' ? 'w dół' : '—'}</dd>
            <dt className="text-muted">Warstwy</dt>
            <dd className="font-medium">
              {stats.layers} × {project.layers.B ? 'A/B naprzemiennie' : 'A'}
            </dd>
            <dt className="text-muted">Chwyt</dt>
            <dd className="font-medium">{project.robot.pickMode === 'podwojny' ? 'podwójny (2 sekcje)' : 'pojedynczy'}</dd>
            <dt className="text-muted">Cykle</dt>
            <dd className="font-medium">
              {stats.totalCycles} łącznie ({stats.cyclesPerLayer} / warstwę)
            </dd>
          </dl>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Przed uruchomieniem</h3>
            <span className="text-[11.5px] text-subtle tabular-nums">
              {done}/{CHECKLIST.length}
            </span>
          </div>
          <ul className="flex flex-col gap-0.5">
            {CHECKLIST.map((label, idx) => (
              <li key={label}>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] leading-snug hover:bg-hover">
                  <input
                    type="checkbox"
                    checked={checked[idx]}
                    onChange={(e) => setChecked((c) => c.map((v, i) => (i === idx ? e.target.checked : v)))}
                    className="mt-0.5 size-3.5 shrink-0 accent-(--accent)"
                  />
                  <span className={cx(checked[idx] && 'text-subtle line-through')}>{label}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 rounded-lg bg-warning-soft px-3 py-2 text-[11.5px] leading-snug">
            Kod jest szablonem stanowiskowym. Zawsze zweryfikuj go w symulatorze lub trybie krokowym przed pracą automatyczną.
          </p>
        </section>
      </aside>
    </div>
  )
}
