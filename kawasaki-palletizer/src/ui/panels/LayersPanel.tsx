import { AlignCenter, Copy, Eraser, Link2, ListOrdered, RotateCw, Sparkles, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { formatMm, formatPercent } from '../../core/format'
import { CORNERS } from '../../core/geometry'
import { compareAB, layerSequence, ORDER_STRATEGY_LABELS, type OrderStrategy } from '../../core/layers'
import type { Corner } from '../../core/types'
import { isLayerEditable, useStore } from '../../state/store'
import { useStats } from '../hooks'
import { cx } from '../cx'
import { Badge, Button, Callout, Field, NumberField, Section, Select, Switch, TextField } from '../kit'

export function LayersPanel() {
  const project = useStore((s) => s.project)
  const activeLayer = useStore((s) => s.activeLayer)
  const store = useStore.getState()
  const stats = useStats()
  const sequence = layerSequence(project)
  const layerB = project.layers.B
  const editable = isLayerEditable(project, activeLayer)
  const [strategy, setStrategy] = useState<OrderStrategy>('rows')
  const [corner, setCorner] = useState<Corner>('A')
  const ids = { layers: useId(), thickness: useId(), every: useId(), call: useId() }
  const comparison = layerB && layerB.link === null ? compareAB(project) : []
  const differences = comparison.filter((c) => c.severity !== 'info')

  return (
    <>
      <Section title="Stos">
        <Field label="Liczba warstw" htmlFor={ids.layers}>
          <NumberField id={ids.layers} value={project.robot.layers} min={1} max={100} integer onChange={(layers) => store.setRobot({ layers })} />
        </Field>
        <div>
          <p className="mb-1.5 text-[12px] font-medium text-muted">Kolejność szablonów (od dołu)</p>
          <div className="flex flex-wrap gap-1" data-testid="layer-sequence">
            {sequence.map((name, idx) => (
              <span
                key={idx}
                title={`Warstwa ${idx + 1}: szablon ${name}`}
                className="flex size-6 items-center justify-center rounded-md text-[11px] font-bold"
                style={{
                  background: name === 'A' ? 'var(--item-a)' : 'var(--item-b)',
                  color: name === 'A' ? 'var(--item-a-text)' : 'var(--item-b-text)',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2">
          <Stat label="Produktów na warstwie" value={String(stats.perLayerA)} />
          <Stat label="Produktów na palecie" value={String(stats.totalProducts)} />
          <Stat label="Wypełnienie palety" value={formatPercent(stats.fill)} />
          <Stat label="Wysokość stosu" value={`${formatMm(stats.stackHeight)} mm`} />
        </dl>
      </Section>

      <Section title="Warstwa B" action={layerB ? <Badge tone={layerB.link ? 'accent' : 'neutral'}>{layerB.link ? 'powiązana' : 'niezależna'}</Badge> : undefined}>
        {!layerB ? (
          <>
            <p className="-mt-1 text-[12.5px] leading-snug text-muted">
              Druga warstwa przekłada układ, aby stos się wiązał. Warstwy układane są na przemian: A, B, A, B…
            </p>
            <Button variant="primary" icon={<RotateCw size={15} />} onClick={() => store.createLayerB('rot180')} data-testid="create-b-rot180">
              Utwórz B jako obrót A o 180°
            </Button>
            <Button icon={<Copy size={15} />} onClick={() => store.createLayerB('copy')}>
              Utwórz B jako kopię A
            </Button>
          </>
        ) : (
          <>
            <Switch
              checked={layerB.link === 'rot180'}
              onChange={(linked) => store.setLayerBLink(linked)}
              label="Powiązana z warstwą A"
              description="B jest zawsze obrotem A o 180° względem środka palety"
            />
            {layerB.link === null &&
              (differences.length === 0 ? (
                <Callout tone="success" icon={<Link2 size={15} />}>
                  Warstwa B jest zgodna z obrotem A o 180°.
                </Callout>
              ) : (
                <Callout tone="warning" icon={<Link2 size={15} />}>
                  <p className="font-medium">Warstwa B różni się od obrotu A ({differences.length})</p>
                  <ul className="mt-1 list-disc pl-4 text-muted">
                    {differences.slice(0, 4).map((d, idx) => (
                      <li key={idx}>{d.message}</li>
                    ))}
                    {differences.length > 4 && <li>…i {differences.length - 4} więcej</li>}
                  </ul>
                </Callout>
              ))}
            <Button
              variant="ghost"
              className="self-start text-danger hover:bg-danger-soft hover:text-danger"
              icon={<Trash2 size={15} />}
              onClick={() =>
                store.askConfirm({
                  title: 'Usunąć warstwę B?',
                  message: 'Wszystkie warstwy stosu będą układane według szablonu A.',
                  confirmLabel: 'Usuń warstwę B',
                  danger: true,
                  onConfirm: () => useStore.getState().removeLayerB(),
                })
              }
            >
              Usuń warstwę B
            </Button>
          </>
        )}
      </Section>

      <Section title={`Układ warstwy ${activeLayer}`}>
        <Button icon={<Sparkles size={15} />} onClick={() => store.openDialog('generator')}>
          Generator układu…
        </Button>
        <div className={cx('flex flex-col gap-2.5', !editable && 'pointer-events-none opacity-45')}>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Select
              ariaLabel="Sposób numeracji"
              value={strategy}
              onChange={setStrategy}
              options={(Object.keys(ORDER_STRATEGY_LABELS) as OrderStrategy[]).map((s) => ({ value: s, label: ORDER_STRATEGY_LABELS[s] }))}
            />
            <Select
              ariaLabel="Narożnik początkowy"
              value={corner}
              onChange={setCorner}
              options={CORNERS.map((c) => ({ value: c, label: `od ${c}` }))}
              className="w-20"
            />
          </div>
          <Button icon={<ListOrdered size={15} />} onClick={() => store.applyAutoOrder(strategy, corner)} data-testid="auto-order">
            Ponumeruj automatycznie
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button icon={<AlignCenter size={15} />} onClick={() => store.centerLayer()}>
              Wyśrodkuj
            </Button>
            <Button
              icon={<Eraser size={15} />}
              onClick={() =>
                store.askConfirm({
                  title: `Wyczyścić warstwę ${activeLayer}?`,
                  message: 'Wszystkie produkty z aktywnej warstwy zostaną usunięte. Operację można cofnąć (Ctrl+Z).',
                  confirmLabel: 'Wyczyść warstwę',
                  danger: true,
                  onConfirm: () => useStore.getState().clearLayer(),
                })
              }
            >
              Wyczyść
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Przekładki">
        <Switch
          checked={project.slipSheet.enabled}
          onChange={(enabled) => store.setSlipSheet({ enabled })}
          label="Przekładki między warstwami"
          description="Zwiększają wysokość kolejnych warstw; trajektorię pobrania uzupełnij na stanowisku"
        />
        {project.slipSheet.enabled && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Grubość" htmlFor={ids.thickness}>
                <NumberField id={ids.thickness} value={project.slipSheet.thickness} min={0} max={200} step={0.5} unit="mm" onChange={(thickness) => store.setSlipSheet({ thickness })} />
              </Field>
              <Field label="Co ile warstw" htmlFor={ids.every}>
                <NumberField id={ids.every} value={project.slipSheet.every} min={1} max={50} integer onChange={(every) => store.setSlipSheet({ every })} />
              </Field>
            </div>
            <Field label="Podprogram AS (opcjonalnie)" htmlFor={ids.call} hint="Jeśli podasz nazwę, w kodzie pojawi się CALL w miejscu przekładki.">
              <TextField id={ids.call} mono value={project.slipSheet.callProgram} placeholder="np. przekladka" onChange={(callProgram) => store.setSlipSheet({ callProgram })} />
            </Field>
            <p className="text-[11.5px] text-subtle">Przekładek w stosie: {stats.slipSheets}</p>
          </>
        )}
      </Section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-raised px-3 py-2">
      <dt className="text-[11px] leading-tight text-subtle">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
