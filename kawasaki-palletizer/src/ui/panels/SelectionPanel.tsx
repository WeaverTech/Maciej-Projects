import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  Copy,
  ClipboardCopy,
  Lock,
  MousePointerClick,
  RotateCw,
  Trash2,
} from 'lucide-react'
import { Fragment, useId } from 'react'
import { pointExpression } from '../../core/asExport'
import { formatMm, productsLabel } from '../../core/format'
import { fromBase, orientationO, placementRect, rectsBounds, ROTATIONS, toBase, axesValid } from '../../core/geometry'
import { getLayer, type AlignMode } from '../../core/layers'
import type { Placement } from '../../core/types'
import { copyText } from '../../state/fileAccess'
import { isLayerEditable, useStore } from '../../state/store'
import { useIssues } from '../hooks'
import { Button, Field, IconButton, Kbd, NumberField, Section, Segmented } from '../kit'

export function SelectionPanel() {
  const project = useStore((s) => s.project)
  const activeLayer = useStore((s) => s.activeLayer)
  const selection = useStore((s) => s.selection)
  const layer = getLayer(project, activeLayer)
  const editable = isLayerEditable(project, activeLayer)
  const selected = layer.items.filter((i) => selection.includes(i.id))

  if (selected.length === 0) return <EmptySelection editable={editable} />
  if (selected.length === 1) return <SingleItem item={selected[0]} editable={editable} count={layer.items.length} />
  return <MultiSelection items={selected} editable={editable} />
}

function EmptySelection({ editable }: { editable: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-raised text-subtle">
        {editable ? <MousePointerClick size={22} /> : <Lock size={20} />}
      </div>
      <div>
        <p className="text-[13.5px] font-semibold">{editable ? 'Nic nie zaznaczono' : 'Warstwa tylko do podglądu'}</p>
        <p className="mt-1 text-[12.5px] leading-snug text-muted">
          {editable
            ? 'Kliknij produkt na palecie, aby zobaczyć i zmienić jego pozycję, obrót oraz kolejność.'
            : 'Warstwa B jest powiązana z A. Kliknij produkt, aby odczytać jego współrzędne, lub odłącz warstwę, aby ją edytować.'}
        </p>
      </div>
      {editable && (
        <ul className="mt-2 flex w-full flex-col gap-2 text-left text-[12px] text-muted">
          <Hint keys={['Przeciągnij']} text="przesuwa produkt z przyciąganiem" />
          <Hint keys={['Shift', 'klik']} text="zaznacza kilka produktów" />
          <Hint keys={['R']} text="obraca o 90°" />
          <Hint keys={['↑', '↓', '←', '→']} text="przesuwa o 1 mm (z Shift o 10 mm)" />
          <Hint keys={['2× klik']} text="na palecie dodaje produkt" />
        </ul>
      )}
    </div>
  )
}

function Hint({ keys, text }: { keys: string[]; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="flex shrink-0 gap-1">
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </span>
      <span>{text}</span>
    </li>
  )
}

function SingleItem({ item, editable, count }: { item: Placement; editable: boolean; count: number }) {
  const project = useStore((s) => s.project)
  const activeLayer = useStore((s) => s.activeLayer)
  const coordMode = useStore((s) => s.coordMode)
  const store = useStore.getState()
  const { allIssues } = useIssues()
  const ids = { order: useId(), x: useId(), y: useId() }

  const validAxes = axesValid(project.pallet)
  const mode = validAxes ? coordMode : 'board'
  const base = toBase(item.x, item.y, project.pallet)
  const shown = mode === 'base' ? base : { x: item.x, y: item.y }
  const rect = placementRect(item, project.product)
  const related = allIssues.filter((i) => i.layer === activeLayer && i.itemIds?.includes(item.id))
  const pointName = `w${activeLayer.toLowerCase()}_cel[${item.order}]`
  const pointLine = `POINT ${pointName} = ${pointExpression(item, project)}`

  const setCoord = (axis: 'x' | 'y', value: number) => {
    if (mode === 'base') {
      const next = fromBase(axis === 'x' ? value : base.x, axis === 'y' ? value : base.y, project.pallet)
      store.patchItem(item.id, next)
    } else {
      store.patchItem(item.id, { [axis]: value })
    }
  }

  return (
    <>
      <Section>
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-xl text-[17px] font-bold tabular-nums"
            style={{
              background: activeLayer === 'A' ? 'var(--item-a)' : 'var(--item-b)',
              color: activeLayer === 'A' ? 'var(--item-a-text)' : 'var(--item-b-text)',
            }}
          >
            {item.order}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold" data-testid="selected-title">
              Produkt {item.order}
            </p>
            <p className="text-[12px] text-muted">
              Warstwa {activeLayer} · obrys {formatMm(rect.x2 - rect.x1)} × {formatMm(rect.y2 - rect.y1)} mm
            </p>
          </div>
          {editable && (
            <div className="flex">
              <IconButton label="Obróć o 90°" shortcut="R" size="sm" onClick={() => store.rotateSelected(90)}>
                <RotateCw size={15} />
              </IconButton>
              <IconButton label="Duplikuj" shortcut="Ctrl+D" size="sm" onClick={() => store.duplicateSelected()}>
                <Copy size={15} />
              </IconButton>
              <IconButton label="Usuń" shortcut="Delete" size="sm" tipAlign="end" onClick={() => store.deleteSelected()}>
                <Trash2 size={15} />
              </IconButton>
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Pozycja środka"
        action={
          <Segmented
            size="sm"
            ariaLabel="Układ współrzędnych"
            value={mode}
            onChange={(coordMode) => store.setPrefs({ coordMode })}
            options={[
              { value: 'board', label: 'Plansza', title: 'Początek w narożniku A, +X w prawo, +Y w dół' },
              { value: 'base', label: 'BASE', title: 'Układ robota', disabled: !validAxes },
            ]}
          />
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="X" htmlFor={ids.x}>
            <NumberField id={ids.x} value={shown.x} decimals={3} step={1} unit="mm" disabled={!editable} onChange={(v) => setCoord('x', v)} />
          </Field>
          <Field label="Y" htmlFor={ids.y}>
            <NumberField id={ids.y} value={shown.y} decimals={3} step={1} unit="mm" disabled={!editable} onChange={(v) => setCoord('y', v)} />
          </Field>
        </div>
        <Field label="Obrót">
          <Segmented
            block
            ariaLabel="Obrót produktu"
            value={item.rotation}
            disabled={!editable}
            onChange={(rotation) => store.patchItem(item.id, { rotation })}
            options={ROTATIONS.map((r) => ({ value: r, label: `${r}°`, testId: `rotation-${r}` }))}
          />
        </Field>
        <Field label="Numer w kolejności układania" htmlFor={ids.order} hint={`1 – ${count}. Pozostałe produkty przesuną się automatycznie.`}>
          <NumberField id={ids.order} value={item.order} min={1} max={count} integer disabled={!editable} onChange={(order) => store.setItemOrder(item.id, order)} />
        </Field>
      </Section>

      <Section title="Punkt dla robota">
        {validAxes ? (
          <>
            <dl className="grid grid-cols-3 gap-2" data-testid="base-coords">
              <Coord label="X BASE" value={formatMm(base.x, 3)} color="var(--axis-x)" />
              <Coord label="Y BASE" value={formatMm(base.y, 3)} color="var(--axis-y)" />
              <Coord label="Kąt O" value={`${formatMm(orientationO(item.rotation, project), 3)}°`} />
            </dl>
            <div className="group relative rounded-lg border border-line bg-raised p-2.5 pr-9">
              <code className="block font-mono text-[11.5px] leading-relaxed [overflow-wrap:anywhere] text-fg" data-testid="point-line">
                {pointLine.split(/(?<=[+,])/).map((part, idx) => (
                  <Fragment key={idx}>
                    {idx > 0 && <wbr />}
                    {part}
                  </Fragment>
                ))}
              </code>
              <IconButton
                label="Kopiuj linię"
                size="sm"
                tipAlign="end"
                className="absolute top-1.5 right-1.5"
                onClick={() => void copyText(pointLine).then((ok) => store.toast(ok ? 'Skopiowano punkt' : 'Nie udało się skopiować', ok ? 'success' : 'error'))}
              >
                <ClipboardCopy size={14} />
              </IconButton>
            </div>
          </>
        ) : (
          <p className="text-[12.5px] text-danger">Osie +X i +Y nie są prostopadłe – popraw je w kroku „Paleta”.</p>
        )}
      </Section>

      {related.length > 0 && (
        <Section title="Problemy tego produktu">
          <ul className="flex flex-col gap-1.5">
            {related.map((issue) => (
              <li
                key={issue.id}
                className="rounded-lg px-2.5 py-1.5 text-[12.5px] leading-snug"
                style={{
                  background: issue.severity === 'error' ? 'var(--danger-soft)' : 'var(--warning-soft)',
                }}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}

function Coord({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-raised px-2.5 py-2">
      <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wide text-subtle uppercase">
        {color && <span className="size-1.5 rounded-full" style={{ background: color }} />}
        {label}
      </dt>
      <dd className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

const ALIGN: { mode: AlignMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'left', label: 'Wyrównaj do lewej', icon: <AlignStartVertical size={16} /> },
  { mode: 'center-x', label: 'Wyśrodkuj w poziomie', icon: <AlignCenterVertical size={16} /> },
  { mode: 'right', label: 'Wyrównaj do prawej', icon: <AlignEndVertical size={16} /> },
  { mode: 'top', label: 'Wyrównaj do góry', icon: <AlignStartHorizontal size={16} /> },
  { mode: 'center-y', label: 'Wyśrodkuj w pionie', icon: <AlignCenterHorizontal size={16} /> },
  { mode: 'bottom', label: 'Wyrównaj do dołu', icon: <AlignEndHorizontal size={16} /> },
]

function MultiSelection({ items, editable }: { items: Placement[]; editable: boolean }) {
  const product = useStore((s) => s.project.product)
  const store = useStore.getState()
  const bounds = rectsBounds(items.map((i) => placementRect(i, product)))

  return (
    <>
      <Section>
        <p className="text-[14px] font-semibold">Zaznaczono {productsLabel(items.length)}</p>
        {bounds && (
          <p className="-mt-2 text-[12px] text-muted">
            Obrys zaznaczenia {formatMm(bounds.x2 - bounds.x1)} × {formatMm(bounds.y2 - bounds.y1)} mm
          </p>
        )}
        <p className="text-[12px] text-subtle">
          Numery:{' '}
          {[...items]
            .sort((a, b) => a.order - b.order)
            .map((i) => i.order)
            .join(', ')}
        </p>
      </Section>
      {editable && (
        <>
          <Section title="Wyrównanie">
            <div className="grid grid-cols-6 gap-1">
              {ALIGN.map((a, idx) => (
                <IconButton
                  key={a.mode}
                  label={a.label}
                  tipAlign={idx < 2 ? 'start' : idx > 3 ? 'end' : 'center'}
                  className="w-full border border-line bg-inset"
                  onClick={() => store.alignSelected(a.mode)}
                >
                  {a.icon}
                </IconButton>
              ))}
            </div>
          </Section>
          <Section title="Działania">
            <div className="grid grid-cols-2 gap-2">
              <Button icon={<RotateCw size={15} />} onClick={() => store.rotateSelected(90)}>
                Obróć o 90°
              </Button>
              <Button icon={<Copy size={15} />} onClick={() => store.duplicateSelected()}>
                Duplikuj
              </Button>
            </div>
            <Button variant="ghost" className="self-start text-danger hover:bg-danger-soft hover:text-danger" icon={<Trash2 size={15} />} onClick={() => store.deleteSelected()}>
              Usuń zaznaczone
            </Button>
          </Section>
        </>
      )}
    </>
  )
}
