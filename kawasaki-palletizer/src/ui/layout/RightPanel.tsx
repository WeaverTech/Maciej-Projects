import { ListOrdered, MousePointerClick, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useStore, type RightTab } from '../../state/store'
import { useIssues } from '../hooks'
import { cx } from '../kit'
import { OrderPanel } from '../panels/OrderPanel'
import { SelectionPanel } from '../panels/SelectionPanel'
import { ValidationPanel } from '../panels/ValidationPanel'

export function RightPanel() {
  const tab = useStore((s) => s.rightTab)
  const selectionCount = useStore((s) => s.selection.length)
  const setTab = useStore((s) => s.setRightTab)
  const { errors, warnings } = useIssues()

  const tabs: { id: RightTab; label: string; icon: ReactNode; badge?: ReactNode }[] = [
    {
      id: 'selection',
      label: 'Zaznaczenie',
      icon: <MousePointerClick size={14} />,
      badge: selectionCount > 0 ? <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-fg">{selectionCount}</span> : null,
    },
    { id: 'order', label: 'Kolejność', icon: <ListOrdered size={14} /> },
    {
      id: 'validation',
      label: 'Walidacja',
      icon: <ShieldCheck size={14} />,
      badge:
        errors > 0 ? (
          <span className="rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">{errors}</span>
        ) : warnings > 0 ? (
          <span className="rounded-full bg-warning px-1.5 text-[10px] font-bold text-white">{warnings}</span>
        ) : null,
    },
  ]

  return (
    <aside className="no-print flex w-[308px] shrink-0 flex-col border-l border-line bg-panel" data-testid="right-panel">
      <div role="tablist" aria-label="Panel boczny" className="flex h-12 shrink-0 items-stretch border-b border-line px-1.5">
        {tabs.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cx(
                'relative flex flex-1 items-center justify-center gap-1.5 text-[12.5px] font-medium transition-colors',
                active ? 'text-fg' : 'text-muted hover:text-fg',
              )}
            >
              {t.icon}
              {t.label}
              {t.badge}
              {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" />}
            </button>
          )
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
        {tab === 'selection' && <SelectionPanel />}
        {tab === 'order' && <OrderPanel />}
        {tab === 'validation' && <ValidationPanel />}
      </div>
    </aside>
  )
}
