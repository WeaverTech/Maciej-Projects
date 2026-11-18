import { ArrowLeft, ArrowRight, Bot, Code2, Grab, Layers, Package, RectangleHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import type { IssueScope } from '../../core/types'
import { useStore, type Step } from '../../state/store'
import { useIssues } from '../hooks'
import { cx } from '../cx'
import { Button } from '../kit'
import { GripperPanel } from '../panels/GripperPanel'
import { LayersPanel } from '../panels/LayersPanel'
import { PalletPanel } from '../panels/PalletPanel'
import { ProductPanel } from '../panels/ProductPanel'
import { RobotPanel } from '../panels/RobotPanel'

interface StepDef {
  id: Step
  label: string
  title: string
  description: string
  icon: ReactNode
  panel: ReactNode
}

const STEPS: StepDef[] = [
  {
    id: 'pallet',
    label: 'Paleta',
    title: 'Paleta i układ BASE',
    description: 'Wymiary palety, narożnik BASE oraz kierunki osi robota.',
    icon: <RectangleHorizontal size={19} />,
    panel: <PalletPanel />,
  },
  {
    id: 'product',
    label: 'Produkt',
    title: 'Produkt',
    description: 'Rodzaj, wymiary i tolerancje układania.',
    icon: <Package size={19} />,
    panel: <ProductPanel />,
  },
  {
    id: 'layers',
    label: 'Warstwy',
    title: 'Warstwy i stos',
    description: 'Układ warstw A/B, liczba warstw i przekładki.',
    icon: <Layers size={19} />,
    panel: <LayersPanel />,
  },
  {
    id: 'gripper',
    label: 'Chwytak',
    title: 'Chwytak',
    description: 'Tryb pobierania, sygnały sekcji i cykle.',
    icon: <Grab size={19} />,
    panel: <GripperPanel />,
  },
  {
    id: 'robot',
    label: 'Robot',
    title: 'Program robota',
    description: 'Nazwy punktów, wysokości, prędkości i orientacja.',
    icon: <Bot size={19} />,
    panel: <RobotPanel />,
  },
]

const SCOPE_STEP: Record<IssueScope, Step> = {
  axes: 'pallet',
  geometry: 'layers',
  order: 'layers',
  layers: 'layers',
  gripper: 'gripper',
  robot: 'robot',
  as: 'robot',
}

export function StepRail() {
  const step = useStore((s) => s.step)
  const store = useStore.getState()
  const { issues } = useIssues()
  const index = STEPS.findIndex((s) => s.id === step)
  const current = STEPS[index] ?? STEPS[0]
  const previous = STEPS[index - 1]
  const next = STEPS[index + 1]

  const worst = new Map<Step, 'error' | 'warning'>()
  for (const issue of issues) {
    const target = SCOPE_STEP[issue.scope]
    if (issue.severity === 'error') worst.set(target, 'error')
    else if (!worst.has(target)) worst.set(target, 'warning')
  }

  return (
    <aside className="no-print flex w-[388px] shrink-0 border-r border-line bg-panel" data-testid="step-panel">
      <nav aria-label="Kroki konfiguracji" className="flex w-[66px] shrink-0 flex-col items-center gap-1 border-r border-line bg-raised/60 py-3">
        {STEPS.map((s, i) => {
          const active = s.id === step
          const state = worst.get(s.id)
          return (
            <button
              key={s.id}
              type="button"
              aria-current={active ? 'step' : undefined}
              data-testid={`step-${s.id}`}
              onClick={() => store.setStep(s.id)}
              className={cx(
                'relative flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10.5px] font-semibold transition-colors',
                active ? 'bg-accent-soft text-accent-text' : 'text-muted hover:bg-hover hover:text-fg',
              )}
            >
              <span className="relative">
                {s.icon}
                {state && (
                  <span
                    className={cx('absolute -top-1 -right-1.5 size-2 rounded-full ring-2 ring-panel', state === 'error' ? 'bg-danger' : 'bg-warning')}
                    aria-label={state === 'error' ? 'zawiera błędy' : 'zawiera ostrzeżenia'}
                  />
                )}
              </span>
              <span>
                <span className="mr-0.5 opacity-55">{i + 1}.</span>
                {s.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-line px-4 pt-3.5 pb-3">
          <h2 className="text-[15px] font-semibold tracking-tight">{current.title}</h2>
          <p className="mt-0.5 text-[12px] text-muted">{current.description}</p>
        </header>
        <div key={current.id} className="min-h-0 flex-1 overflow-y-auto">
          {current.panel}
        </div>
        <footer className="flex items-center justify-between gap-2 border-t border-line bg-raised/50 px-3 py-2.5">
          <Button variant="ghost" size="sm" disabled={!previous} icon={<ArrowLeft size={14} />} onClick={() => previous && store.setStep(previous.id)}>
            Wstecz
          </Button>
          {next ? (
            <Button size="sm" onClick={() => store.setStep(next.id)} data-testid="step-next">
              Dalej: {next.label} <ArrowRight size={14} />
            </Button>
          ) : (
            <Button size="sm" variant="primary" icon={<Code2 size={14} />} onClick={() => store.setView('code')} data-testid="step-next">
              Pokaż kod AS
            </Button>
          )}
        </footer>
      </div>
    </aside>
  )
}
