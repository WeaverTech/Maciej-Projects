import { Check } from 'lucide-react'

interface StepIndicatorProps {
  steps: string[]
  current: number
  onNavigate: (step: number) => void
}

export default function StepIndicator({ steps, current, onNavigate }: StepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => index <= current && onNavigate(index)}
              disabled={index > current}
              className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                active
                  ? 'border-brand-500 bg-brand-500 text-steel-950'
                  : done
                    ? 'border-steel-600 bg-steel-800 text-steel-200 hover:border-brand-500'
                    : 'border-steel-800 bg-steel-900 text-steel-600'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center font-mono text-[10px] ${
                  active
                    ? 'bg-steel-950 text-brand-400'
                    : done
                      ? 'bg-brand-500 text-steel-950'
                      : 'bg-steel-800 text-steel-500'
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
