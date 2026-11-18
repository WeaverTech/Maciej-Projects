import { Check, PackageX } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { formatMm, formatPercent, productsLabel } from '../../core/format'
import { DEFAULT_GENERATOR_OPTIONS, generatePatterns, type GeneratorOptions } from '../../core/generator'
import { CORNERS } from '../../core/geometry'
import { ORDER_STRATEGY_LABELS, type OrderStrategy } from '../../core/layers'
import { useStore } from '../../state/store'
import { Button, cx, Dialog, Field, NumberField, Select } from '../kit'
import { LayerThumb } from '../LayerThumb'

export function GeneratorDialog() {
  const project = useStore((s) => s.project)
  const store = useStore.getState()
  const { pallet, product } = project
  const bagOverhang = product.kind === 'worek' && product.allowOverhang ? product.maxOverhang : 0
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_GENERATOR_OPTIONS)
  const [picked, setPicked] = useState<string | null>(null)
  const ids = { gap: useId(), overhang: useId(), max: useId() }

  const patterns = useMemo(() => generatePatterns(pallet, product, options), [pallet, product, options])
  const selected = patterns.find((p) => p.id === picked) ?? patterns[0] ?? null
  const existing = project.layers.A.items.length
  const set = (patch: Partial<GeneratorOptions>) => setOptions((o) => ({ ...o, ...patch }))
  const close = () => store.openDialog(null)

  return (
    <Dialog
      title="Generator układu warstwy"
      description={`Paleta ${formatMm(pallet.length)} × ${formatMm(pallet.width)} mm · ${product.kind} ${formatMm(product.length)} × ${formatMm(product.width)} mm`}
      onClose={close}
      width={920}
      testId="generator-dialog"
      footer={
        <>
          {existing > 0 && <span className="mr-auto text-[12px] text-muted">Zastąpi obecny układ warstwy A ({productsLabel(existing)}).</span>}
          <Button variant="ghost" onClick={close}>
            Anuluj
          </Button>
          <Button
            variant="primary"
            disabled={!selected}
            data-testid="apply-pattern"
            icon={<Check size={15} />}
            onClick={() => {
              if (!selected) return
              store.applyPattern(selected.items)
              store.openDialog(null)
              store.toast(`Zastosowano układ „${selected.name}” – ${productsLabel(selected.count)}`, 'success')
            }}
          >
            Zastosuj układ
          </Button>
        </>
      }
    >
      <div className="grid min-h-[430px] grid-cols-[250px_1fr]">
        <aside className="flex flex-col gap-3.5 border-r border-line bg-raised/50 p-5">
          <Field label="Odstęp między produktami" htmlFor={ids.gap}>
            <NumberField id={ids.gap} value={options.gap} min={0} max={500} step={5} unit="mm" onChange={(gap) => set({ gap })} />
          </Field>
          <Field
            label="Dopuszczalne wystawanie"
            htmlFor={ids.overhang}
            hint={
              bagOverhang > 0 ? (
                <button type="button" className="text-accent-text underline-offset-2 hover:underline" onClick={() => set({ overhang: bagOverhang })}>
                  Użyj limitu worka: {formatMm(bagOverhang)} mm
                </button>
              ) : product.kind === 'karton' ? (
                'Kartony nie powinny wystawać poza paletę.'
              ) : undefined
            }
          >
            <NumberField id={ids.overhang} value={options.overhang} min={0} max={500} step={5} unit="mm" onChange={(overhang) => set({ overhang })} />
          </Field>
          <Field label="Limit liczby produktów" htmlFor={ids.max} hint="0 = tyle, ile się zmieści.">
            <NumberField id={ids.max} value={options.maxCount} min={0} max={500} integer unit="szt." onChange={(maxCount) => set({ maxCount })} />
          </Field>
          <div className="h-px bg-line" />
          <Field label="Kolejność układania">
            <Select
              ariaLabel="Kolejność układania"
              value={options.order}
              onChange={(order) => set({ order })}
              options={(Object.keys(ORDER_STRATEGY_LABELS) as OrderStrategy[]).map((s) => ({ value: s, label: ORDER_STRATEGY_LABELS[s] }))}
            />
          </Field>
          <Field label="Pierwszy produkt przy narożniku">
            <div role="radiogroup" aria-label="Narożnik początkowy" className="grid grid-cols-4 gap-1.5">
              {CORNERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={options.startCorner === c}
                  onClick={() => set({ startCorner: c })}
                  className={cx(
                    'h-8 rounded-lg border text-[12.5px] font-bold transition-colors',
                    options.startCorner === c ? 'border-accent bg-accent-soft text-accent-text' : 'border-line bg-inset text-muted hover:border-line-strong',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
        </aside>

        <div className="p-5">
          {patterns.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                <PackageX size={24} />
              </div>
              <p className="text-[14px] font-semibold">Produkt nie mieści się na palecie</p>
              <p className="max-w-xs text-[12.5px] text-muted">Zmniejsz odstęp, zwiększ dopuszczalne wystawanie albo sprawdź wymiary palety i produktu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3" role="listbox" aria-label="Proponowane układy">
              {patterns.map((pattern, idx) => {
                const active = selected?.id === pattern.id
                return (
                  <button
                    key={pattern.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-testid="pattern-card"
                    data-autofocus={idx === 0 ? true : undefined}
                    onClick={() => setPicked(pattern.id)}
                    onDoubleClick={() => {
                      store.applyPattern(pattern.items)
                      store.openDialog(null)
                    }}
                    className={cx(
                      'relative flex flex-col rounded-xl border p-3 text-left transition-all',
                      active ? 'border-accent bg-accent-soft/60 ring-3 ring-accent/15' : 'border-line bg-inset hover:border-line-strong',
                    )}
                  >
                    {idx === 0 && (
                      <span className="absolute top-2 right-2 rounded-md bg-success-soft px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success uppercase">
                        najwięcej
                      </span>
                    )}
                    <LayerThumb pallet={pallet} product={product} items={pattern.items} width={170} height={118} className="mx-auto" />
                    <div className="mt-2.5 flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold">{pattern.name}</span>
                      <span className="text-[15px] font-bold tabular-nums">
                        {pattern.count} <span className="text-[11px] font-medium text-muted">szt.</span>
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{pattern.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-accent" style={{ width: formatPercent(pattern.fill) }} />
                      </div>
                      <span className="text-[11px] font-medium text-muted tabular-nums">{formatPercent(pattern.fill)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
