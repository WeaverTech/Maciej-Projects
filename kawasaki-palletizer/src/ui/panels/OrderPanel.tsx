import { ChevronDown, ChevronUp, GripVertical, ListOrdered } from 'lucide-react'
import { useState } from 'react'
import { formatMm } from '../../core/format'
import { axesValid, toBase } from '../../core/geometry'
import { sectionByProduct } from '../../core/gripper'
import { getLayer, sortedByOrder } from '../../core/layers'
import { isLayerEditable, useStore } from '../../state/store'
import { cx } from '../cx'
import { IconButton, Segmented } from '../kit'

export function OrderPanel() {
  const project = useStore((s) => s.project)
  const activeLayer = useStore((s) => s.activeLayer)
  const selection = useStore((s) => s.selection)
  const coordMode = useStore((s) => s.coordMode)
  const store = useStore.getState()
  const [dragId, setDragId] = useState<number | null>(null)
  const [overOrder, setOverOrder] = useState<number | null>(null)

  const items = sortedByOrder(getLayer(project, activeLayer).items)
  const editable = isLayerEditable(project, activeLayer)
  const validAxes = axesValid(project.pallet)
  const mode = validAxes ? coordMode : 'board'
  const sections = project.robot.pickMode === 'podwojny' ? sectionByProduct(project) : null

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-raised text-subtle">
          <ListOrdered size={22} />
        </div>
        <p className="text-[12.5px] leading-snug text-muted">Lista kolejności pojawi się po dodaniu produktów do warstwy {activeLayer}.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="text-[12px] text-muted">Współrzędne środka</span>
        <Segmented
          size="sm"
          ariaLabel="Układ współrzędnych listy"
          value={mode}
          onChange={(coordMode) => store.setPrefs({ coordMode })}
          options={[
            { value: 'board', label: 'Plansza' },
            { value: 'base', label: 'BASE', disabled: !validAxes },
          ]}
        />
      </div>
      <ol className="min-h-0 flex-1 overflow-y-auto p-2" data-testid="order-list">
        {items.map((item) => {
          const selected = selection.includes(item.id)
          const p = mode === 'base' ? toBase(item.x, item.y, project.pallet) : item
          const section = sections?.get(item.order)
          return (
            <li
              key={item.id}
              data-order-row={item.order}
              draggable={editable}
              onDragStart={(e) => {
                setDragId(item.id)
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', String(item.id))
              }}
              onDragOver={(e) => {
                if (dragId === null) return
                e.preventDefault()
                setOverOrder(item.order)
              }}
              onDragEnd={() => {
                setDragId(null)
                setOverOrder(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (dragId !== null && dragId !== item.id) store.setItemOrder(dragId, item.order)
                setDragId(null)
                setOverOrder(null)
              }}
              onClick={(e) => (e.shiftKey || e.ctrlKey || e.metaKey ? store.toggleSelect(item.id) : store.select([item.id]))}
              className={cx(
                'group flex cursor-pointer items-center gap-2 rounded-lg border px-1.5 py-1.5 transition-colors',
                selected ? 'border-accent/40 bg-accent-soft' : 'border-transparent hover:bg-hover',
                overOrder === item.order && dragId !== item.id && 'border-accent border-dashed',
                dragId === item.id && 'opacity-40',
              )}
            >
              <GripVertical size={14} className={cx('shrink-0 text-subtle', editable ? 'cursor-grab' : 'opacity-0')} />
              <span
                className="flex size-6.5 shrink-0 items-center justify-center rounded-md text-[12px] font-bold tabular-nums"
                style={{
                  background: activeLayer === 'A' ? 'var(--item-a)' : 'var(--item-b)',
                  color: activeLayer === 'A' ? 'var(--item-a-text)' : 'var(--item-b-text)',
                }}
              >
                {item.order}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-fg tabular-nums">
                {formatMm(p.x)} ; {formatMm(p.y)}
              </span>
              <span className="w-8 text-right text-[11.5px] text-muted tabular-nums">{item.rotation}°</span>
              {section && (
                <span
                  className="rounded px-1 text-[10px] font-bold text-white"
                  title={`Cykl ${section.cycle}, sekcja ${section.section}`}
                  style={{ background: section.section === 1 ? 'var(--accent)' : 'var(--warning)' }}
                >
                  C{section.cycle}·S{section.section}
                </span>
              )}
              {editable && (
                <span className={cx('flex shrink-0', selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                  <IconButton
                    label="Wcześniej"
                    size="sm"
                    tipAlign="end"
                    disabled={item.order <= 1}
                    onClick={(e) => {
                      e.stopPropagation()
                      store.setItemOrder(item.id, item.order - 1)
                    }}
                  >
                    <ChevronUp size={14} />
                  </IconButton>
                  <IconButton
                    label="Później"
                    size="sm"
                    tipAlign="end"
                    disabled={item.order >= items.length}
                    onClick={(e) => {
                      e.stopPropagation()
                      store.setItemOrder(item.id, item.order + 1)
                    }}
                  >
                    <ChevronDown size={14} />
                  </IconButton>
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {editable && (
        <p className="border-t border-line px-4 py-2.5 text-[11.5px] leading-snug text-subtle">
          Przeciągnij wiersz, aby zmienić kolejność układania, albo użyj narzędzia „Ustal kolejność klikaniem” na pasku edytora.
        </p>
      )}
    </div>
  )
}
