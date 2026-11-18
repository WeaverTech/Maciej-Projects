import { AlertTriangle, CircleCheck, CircleX, Wand2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { errorsLabel, warningsLabel } from '../../core/format'
import type { Issue, IssueScope } from '../../core/types'
import { useStore, type Step } from '../../state/store'
import { useIssues } from '../hooks'
import { cx } from '../cx'
import { Button } from '../kit'

const SCOPE_LABELS: Record<IssueScope, string> = {
  geometry: 'Geometria',
  order: 'Kolejność',
  axes: 'Osie',
  layers: 'Warstwy',
  gripper: 'Chwytak',
  robot: 'Robot',
  as: 'Kod AS',
}

const SCOPE_STEP: Partial<Record<IssueScope, Step>> = {
  axes: 'pallet',
  layers: 'layers',
  gripper: 'gripper',
  robot: 'robot',
}

const FIX_LABELS: Record<NonNullable<Issue['fix']>, string> = {
  'auto-pair': 'Paruj kolejno',
  renumber: 'Ponumeruj',
  'relink-b': 'Odtwórz B z A',
}

function applyFix(fix: NonNullable<Issue['fix']>, issue: Issue) {
  const store = useStore.getState()
  switch (fix) {
    case 'auto-pair':
      store.autoPair()
      break
    case 'renumber':
      if (issue.layer) store.setActiveLayer(issue.layer)
      store.renumber()
      break
    case 'relink-b':
      store.setLayerBLink(true)
      break
  }
}

export function ValidationPanel() {
  const { issues, errors, warnings } = useIssues()
  const store = useStore.getState()

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center" data-testid="validation-ok">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CircleCheck size={26} />
        </div>
        <div>
          <p className="text-[14px] font-semibold">Projekt jest poprawny</p>
          <p className="mt-1 text-[12.5px] leading-snug text-muted">
            Nie znaleziono błędów ani ostrzeżeń. Walidacja 2D nie zastępuje analizy kolizji robota i chwytaka.
          </p>
        </div>
      </div>
    )
  }

  const focus = (issue: Issue) => {
    if (issue.layer) {
      store.setActiveLayer(issue.layer)
      store.setView('layout')
      if (issue.itemIds?.length) useStore.getState().select(issue.itemIds)
    }
    const step = SCOPE_STEP[issue.scope]
    if (step) store.setStep(step)
  }

  // Jedna szybka poprawka na grupę problemów wystarczy (np. wszystkie błędy cykli).
  const shownFixes = new Set<string>()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3" data-testid="validation-summary">
        {errors > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-danger-soft px-2 py-1 text-[12.5px] font-semibold text-danger">
            <CircleX size={14} />
            {errorsLabel(errors)}
          </span>
        )}
        {warnings > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-warning-soft px-2 py-1 text-[12.5px] font-semibold text-warning">
            <AlertTriangle size={14} />
            {warningsLabel(warnings)}
          </span>
        )}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2" data-testid="issue-list">
        {issues.map((issue) => {
          const fixKey = issue.fix ? `${issue.fix}:${issue.layer ?? ''}` : null
          const showFix = fixKey !== null && !shownFixes.has(fixKey)
          if (fixKey) shownFixes.add(fixKey)
          return (
            <li key={issue.id}>
              <IssueRow issue={issue} onFocus={() => focus(issue)} action={showFix && issue.fix ? (
                <Button
                  size="sm"
                  icon={<Wand2 size={13} />}
                  onClick={(e) => {
                    e.stopPropagation()
                    applyFix(issue.fix!, issue)
                  }}
                >
                  {FIX_LABELS[issue.fix]}
                </Button>
              ) : null} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function IssueRow({ issue, onFocus, action }: { issue: Issue; onFocus: () => void; action: ReactNode }) {
  const error = issue.severity === 'error'
  return (
    <div
      role="button"
      tabIndex={0}
      data-severity={issue.severity}
      onClick={onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFocus()
        }
      }}
      className="flex cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-hover"
    >
      <span className={cx('mt-0.5 shrink-0', error ? 'text-danger' : 'text-warning')}>
        {error ? <CircleX size={15} /> : <AlertTriangle size={15} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] leading-snug text-fg">{issue.message}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] font-medium text-subtle">
            {SCOPE_LABELS[issue.scope]}
            {issue.layer && issue.scope !== 'layers' ? ` · warstwa ${issue.layer}` : ''}
          </span>
          {action}
        </div>
      </div>
    </div>
  )
}
