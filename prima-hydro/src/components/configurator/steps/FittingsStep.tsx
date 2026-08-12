import { CornerDownRight, RotateCw } from 'lucide-react'
import {
  FITTING_ANGLES,
  FITTING_FAMILIES,
  ORIENTATION_ANGLES,
  ORIENTATION_SURCHARGE,
} from '../../../data/catalog'
import type { DnId } from '../../../data/catalog'
import { fittingPrice, formatPln, orientationRelevant } from '../../../lib/pricing'
import type { EndConfig } from '../../../lib/pricing'
import OptionButton from '../../ui/OptionButton'

interface FittingsStepProps {
  dn: DnId
  endA: EndConfig
  endB: EndConfig
  orientationDeg: number
  onEndAChange: (value: EndConfig) => void
  onEndBChange: (value: EndConfig) => void
  onOrientationChange: (value: number) => void
}

function EndSelector({
  label,
  dn,
  value,
  onChange,
}: {
  label: string
  dn: DnId
  value: EndConfig
  onChange: (value: EndConfig) => void
}) {
  return (
    <div className="border border-steel-700 bg-steel-900 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-brand-500 font-mono text-sm font-black text-steel-950">
          {label}
        </span>
        <span className="text-sm font-bold uppercase tracking-wide text-steel-200">
          Końcówka – strona {label}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {FITTING_FAMILIES.map((family) => (
          <OptionButton
            key={family.id}
            selected={value.family === family.id}
            onClick={() => onChange({ ...value, family: family.id })}
            className="p-3"
          >
            <span className="block font-mono text-base font-bold text-white">{family.name}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-steel-400">
              {family.thread}
            </span>
            <span className="mt-1.5 block font-mono text-[11px] text-brand-400">
              {formatPln(fittingPrice(dn, { family: family.id, angle: value.angle }))} netto
            </span>
          </OptionButton>
        ))}
      </div>

      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-steel-400">
        Wersja kątowa
      </span>
      <div className="grid grid-cols-3 gap-2">
        {FITTING_ANGLES.map(({ value: angle, label: angleLabel }) => (
          <OptionButton
            key={angle}
            selected={value.angle === angle}
            onClick={() => onChange({ ...value, angle })}
            className="p-2.5 text-center"
          >
            <CornerDownRight
              className="mx-auto mb-1 h-4 w-4 text-brand-500"
              style={{ transform: `rotate(${angle === 0 ? -45 : angle === 45 ? 0 : 45}deg)` }}
            />
            <span className="block text-xs font-bold text-white">{angleLabel}</span>
          </OptionButton>
        ))}
      </div>
    </div>
  )
}

export default function FittingsStep({
  dn,
  endA,
  endB,
  orientationDeg,
  onEndAChange,
  onEndBChange,
  onOrientationChange,
}: FittingsStepProps) {
  const showOrientation = orientationRelevant({ endA, endB })

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <EndSelector label="A" dn={dn} value={endA} onChange={onEndAChange} />
        <EndSelector label="B" dn={dn} value={endB} onChange={onEndBChange} />
      </div>

      {showOrientation ? (
        <div className="border border-steel-700 bg-steel-900 p-5">
          <div className="mb-1 flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-brand-500" />
            <span className="text-sm font-bold uppercase tracking-wide text-steel-200">
              Kąt skręcenia końcówek A/B
            </span>
          </div>
          <p className="mb-4 text-xs text-steel-500">
            Obie końcówki są kątowe – określ ich wzajemne położenie patrząc wzdłuż osi węża.
            Ustawienie inne niż 0° to dopłata {formatPln(ORIENTATION_SURCHARGE)} netto.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ORIENTATION_ANGLES.map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => onOrientationChange(angle)}
                className={`border px-2.5 py-1.5 font-mono text-xs transition-colors ${
                  orientationDeg === angle
                    ? 'border-brand-500 bg-brand-500 text-steel-950'
                    : 'border-steel-700 text-steel-400 hover:border-steel-400 hover:text-steel-200'
                }`}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="border border-steel-800 bg-steel-900/50 px-4 py-3 font-mono text-xs text-steel-500">
          Kąt skręcenia dotyczy tylko konfiguracji, w której obie końcówki są kolankami (45°/90°).
        </p>
      )}
    </div>
  )
}
