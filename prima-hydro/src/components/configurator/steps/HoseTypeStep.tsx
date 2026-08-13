import { Layers } from 'lucide-react'
import { HOSE_TYPES } from '../../../data/catalog'
import type { HoseTypeId } from '../../../data/catalog'
import OptionButton from '../../ui/OptionButton'

interface HoseTypeStepProps {
  value: HoseTypeId
  onChange: (value: HoseTypeId) => void
}

export default function HoseTypeStep({ value, onChange }: HoseTypeStepProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {HOSE_TYPES.map((hose) => {
        const maxPressure = Math.max(...Object.values(hose.workingPressure))
        return (
          <OptionButton
            key={hose.id}
            selected={value === hose.id}
            onClick={() => onChange(hose.id)}
          >
            <div className="mb-2 flex items-center gap-2">
              <Layers className="h-5 w-5 text-brand-500" />
              <span className="font-mono text-xl font-bold text-white">{hose.id}</span>
            </div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-hazard-400">
              {hose.norm}
            </p>
            <p className="mb-3 text-xs leading-relaxed text-steel-400">{hose.description}</p>
            <dl className="space-y-1 border-t border-steel-800 pt-2 font-mono text-[11px] text-steel-300">
              <div className="flex justify-between">
                <dt className="text-steel-500">Zbrojenie</dt>
                <dd>{hose.reinforcement}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel-500">Ciśnienie do</dt>
                <dd className="text-brand-400">{maxPressure} bar</dd>
              </div>
            </dl>
          </OptionButton>
        )
      })}
    </div>
  )
}
