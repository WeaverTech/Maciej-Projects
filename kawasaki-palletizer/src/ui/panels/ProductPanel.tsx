import { Box, Info, ShoppingBag } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { formatMm } from '../../core/format'
import type { ProductKind } from '../../core/types'
import { useStore } from '../../state/store'
import { cx } from '../cx'
import { Callout, Field, NumberField, Section, Switch } from '../kit'

const KINDS: { value: ProductKind; label: string; description: string; icon: ReactNode }[] = [
  { value: 'worek', label: 'Worek', description: 'Dopuszcza kontrolowane wystawanie i nakładanie', icon: <ShoppingBag size={18} /> },
  { value: 'karton', label: 'Karton', description: 'Sztywny – bez wystawania i nakładania', icon: <Box size={18} /> },
]

export function ProductPanel() {
  const product = useStore((s) => s.project.product)
  const setProduct = useStore((s) => s.setProduct)
  const ids = { l: useId(), w: useId(), h: useId(), inc: useId(), oh: useId(), ov: useId() }
  const bag = product.kind === 'worek'

  return (
    <>
      <Section title="Rodzaj produktu">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Rodzaj produktu">
          {KINDS.map((k) => {
            const selected = product.kind === k.value
            return (
              <button
                key={k.value}
                type="button"
                role="radio"
                aria-checked={selected}
                data-testid={`kind-${k.value}`}
                onClick={() => setProduct({ kind: k.value })}
                className={cx(
                  'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors',
                  selected ? 'border-accent bg-accent-soft' : 'border-line bg-inset hover:border-line-strong',
                )}
              >
                <span className={cx('flex size-8 items-center justify-center rounded-lg', selected ? 'bg-accent text-accent-fg' : 'bg-raised text-muted')}>
                  {k.icon}
                </span>
                <span className="text-[13px] font-semibold">{k.label}</span>
                <span className="text-[11.5px] leading-snug text-muted">{k.description}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Wymiary">
        <div className="grid grid-cols-3 gap-2.5">
          <Field label="Długość" htmlFor={ids.l}>
            <NumberField id={ids.l} value={product.length} min={1} max={5000} step={5} unit="mm" onChange={(length) => setProduct({ length })} />
          </Field>
          <Field label="Szerokość" htmlFor={ids.w}>
            <NumberField id={ids.w} value={product.width} min={1} max={5000} step={5} unit="mm" onChange={(width) => setProduct({ width })} />
          </Field>
          <Field label="Wysokość" htmlFor={ids.h}>
            <NumberField
              id={ids.h}
              value={product.height}
              min={1}
              max={5000}
              step={5}
              unit="mm"
              onChange={(height) =>
                // Przyrost warstwy podąża za wysokością, dopóki nie został ustawiony osobno.
                setProduct(product.layerIncrement === product.height ? { height, layerIncrement: height } : { height })
              }
            />
          </Field>
        </div>
        <Field
          label="Przyrost wysokości na warstwę"
          htmlFor={ids.inc}
          hint={
            product.layerIncrement === product.height
              ? 'Równy wysokości produktu. Zmniejsz, jeśli produkt osiada po ułożeniu.'
              : `Różni się od wysokości produktu (${formatMm(product.height)} mm).`
          }
        >
          <NumberField id={ids.inc} value={product.layerIncrement} min={0.1} max={5000} step={1} unit="mm" onChange={(layerIncrement) => setProduct({ layerIncrement })} />
        </Field>
      </Section>

      <Section title="Tolerancje układu">
        {bag ? (
          <>
            <Switch
              checked={product.allowOverhang}
              onChange={(allowOverhang) => setProduct({ allowOverhang })}
              label="Wystawanie poza paletę"
              description="W limicie – ostrzeżenie, powyżej – błąd"
            />
            <Field label="Maksymalne wystawanie" htmlFor={ids.oh}>
              <NumberField id={ids.oh} value={product.maxOverhang} min={0} max={500} step={5} unit="mm" disabled={!product.allowOverhang} onChange={(maxOverhang) => setProduct({ maxOverhang })} />
            </Field>
            <div className="h-px bg-line" />
            <Switch
              checked={product.allowOverlap}
              onChange={(allowOverlap) => setProduct({ allowOverlap })}
              label="Nakładanie worków"
              description="Worki mogą zachodzić na siebie o podaną wartość"
            />
            <Field label="Maksymalne nakładanie" htmlFor={ids.ov}>
              <NumberField id={ids.ov} value={product.maxOverlap} min={0} max={500} step={5} unit="mm" disabled={!product.allowOverlap} onChange={(maxOverlap) => setProduct({ maxOverlap })} />
            </Field>
          </>
        ) : (
          <Callout icon={<Info size={15} />}>Kartony nie mogą wystawać poza paletę ani nakładać się na siebie – każde takie miejsce jest błędem walidacji.</Callout>
        )}
      </Section>
    </>
  )
}
