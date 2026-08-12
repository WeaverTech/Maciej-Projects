import { DN_SIZES, getHoseType, isDnAvailable } from '../../../data/catalog'
import type { DnId, HoseTypeId } from '../../../data/catalog'
import OptionButton from '../../ui/OptionButton'

interface DiameterStepProps {
  hoseType: HoseTypeId
  value: DnId
  onChange: (value: DnId) => void
}

export default function DiameterStep({ hoseType, value, onChange }: DiameterStepProps) {
  const hose = getHoseType(hoseType)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {DN_SIZES.map((dn) => {
          const available = isDnAvailable(hoseType, dn.id)
          const pressure = hose.workingPressure[dn.id]
          return (
            <OptionButton
              key={dn.id}
              selected={value === dn.id}
              disabled={!available}
              onClick={() => onChange(dn.id)}
              className="text-center"
            >
              <span className="block font-mono text-lg font-bold text-white">{dn.id}</span>
              <span className="block font-mono text-xs text-steel-400">
                ⌀ {dn.innerMm.toFixed(1)} mm · {dn.inch}
              </span>
              <span className="mt-2 block border-t border-steel-800 pt-1.5 font-mono text-[11px] text-brand-400">
                {available ? `${pressure} bar` : 'niedostępne'}
              </span>
            </OptionButton>
          )
        })}
      </div>
      <p className="mt-4 font-mono text-xs text-steel-500">
        * Podane ciśnienie to maksymalne ciśnienie robocze dla węża {hose.id} ({hose.norm}).
      </p>
    </div>
  )
}
