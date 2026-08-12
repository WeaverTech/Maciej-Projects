import { ClipboardList } from 'lucide-react'
import { getDnSize, getHoseType } from '../../data/catalog'
import { calculatePrice, formatPln, orientationRelevant } from '../../lib/pricing'
import type { HoseConfig } from '../../lib/pricing'

interface SpecPreviewProps {
  config: HoseConfig
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-steel-800 py-1.5">
      <dt className="text-xs uppercase tracking-wide text-steel-500">{label}</dt>
      <dd className="text-right font-mono text-sm text-steel-200">{value}</dd>
    </div>
  )
}

/** Podgląd specyfikacji i wycena na żywo – widoczny przez cały czas konfiguracji */
export default function SpecPreview({ config }: SpecPreviewProps) {
  const hose = getHoseType(config.hoseType)
  const dn = getDnSize(config.dn)
  const price = calculatePrice(config)

  const endLabel = (end: HoseConfig['endA']) =>
    `${end.family} ${end.angle === 0 ? 'prosta' : `${end.angle}°`}`

  return (
    <aside className="border border-steel-700 bg-steel-900">
      <div className="flex items-center gap-2 border-b border-steel-700 bg-steel-850 px-5 py-3">
        <ClipboardList className="h-4 w-4 text-brand-500" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">
          Twoja specyfikacja
        </h3>
      </div>

      <dl className="px-5 py-4">
        <SpecRow label="Wąż" value={`${hose.id} · ${hose.norm}`} />
        <SpecRow label="Średnica" value={`${dn.id} (⌀ ${dn.innerMm.toFixed(1)} mm / ${dn.inch})`} />
        <SpecRow
          label="Ciśn. robocze"
          value={`${hose.workingPressure[config.dn] ?? '—'} bar`}
        />
        <SpecRow label="Długość" value={`${config.lengthMm} mm`} />
        <SpecRow label="Końcówka A" value={endLabel(config.endA)} />
        <SpecRow label="Końcówka B" value={endLabel(config.endB)} />
        {orientationRelevant(config) && (
          <SpecRow label="Kąt skręcenia" value={`${config.orientationDeg}°`} />
        )}
        <SpecRow label="Ilość" value={`${config.quantity} szt.`} />
      </dl>

      <div className="border-t border-steel-700 px-5 py-4">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-hazard-400">
          Wycena (1 szt.)
        </h4>
        <ul className="space-y-1.5">
          {price.lines.map((line) => (
            <li key={line.label} className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-steel-400">
                {line.label}
                {line.detail && (
                  <span className="ml-1 font-mono text-[10px] text-steel-600">
                    ({line.detail})
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap font-mono text-steel-200">
                {formatPln(line.net)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1 border-t border-steel-700 bg-steel-850 px-5 py-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-steel-400">
            Netto {config.quantity > 1 && `(× ${config.quantity} szt.)`}
          </span>
          <span className="font-mono text-steel-200">{formatPln(price.totalNet)}</span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-steel-400">VAT 23%</span>
          <span className="font-mono text-steel-200">{formatPln(price.vat)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-steel-700 pt-2">
          <span className="text-sm font-bold uppercase tracking-wide text-white">
            Razem brutto
          </span>
          <span className="font-mono text-2xl font-black text-brand-400">
            {formatPln(price.totalGross)}
          </span>
        </div>
        <p className="pt-1 text-[10px] leading-relaxed text-steel-600">
          Wycena szacunkowa. Ostateczna cena zostanie potwierdzona telefonicznie przed realizacją.
        </p>
      </div>
    </aside>
  )
}
