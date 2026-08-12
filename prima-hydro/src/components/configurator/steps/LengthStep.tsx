import { Minus, Plus, Ruler } from 'lucide-react'
import { LENGTH_MAX_MM, LENGTH_MIN_MM, LENGTH_STEP_MM } from '../../../data/catalog'

interface LengthStepProps {
  lengthMm: number
  quantity: number
  onLengthChange: (value: number) => void
  onQuantityChange: (value: number) => void
}

const PRESETS = [500, 1000, 1500, 2000, 3000, 5000]

const clampLength = (v: number) =>
  Math.min(LENGTH_MAX_MM, Math.max(LENGTH_MIN_MM, Math.round(v / LENGTH_STEP_MM) * LENGTH_STEP_MM))

export default function LengthStep({
  lengthMm,
  quantity,
  onLengthChange,
  onQuantityChange,
}: LengthStepProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="border border-steel-700 bg-steel-900 p-5">
        <label
          htmlFor="length-input"
          className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-steel-200"
        >
          <Ruler className="h-4 w-4 text-brand-500" />
          Długość całkowita węża (końcówka–końcówka)
        </label>

        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="Zmniejsz długość"
            onClick={() => onLengthChange(clampLength(lengthMm - 100))}
            className="flex h-12 w-12 shrink-0 items-center justify-center border border-steel-600 text-steel-200 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            <Minus className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <input
              id="length-input"
              type="number"
              min={LENGTH_MIN_MM}
              max={LENGTH_MAX_MM}
              step={LENGTH_STEP_MM}
              value={lengthMm}
              onChange={(e) => onLengthChange(Number(e.target.value) || LENGTH_MIN_MM)}
              onBlur={(e) => onLengthChange(clampLength(Number(e.target.value)))}
              className="w-full border border-steel-600 bg-steel-950 px-4 py-3 text-center font-mono text-2xl font-bold text-white outline-none focus:border-brand-500"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-steel-500">
              mm
            </span>
          </div>
          <button
            type="button"
            aria-label="Zwiększ długość"
            onClick={() => onLengthChange(clampLength(lengthMm + 100))}
            className="flex h-12 w-12 shrink-0 items-center justify-center border border-steel-600 text-steel-200 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <input
          type="range"
          aria-label="Suwak długości"
          min={LENGTH_MIN_MM}
          max={LENGTH_MAX_MM}
          step={LENGTH_STEP_MM}
          value={lengthMm}
          onChange={(e) => onLengthChange(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-steel-500">
          <span>{LENGTH_MIN_MM} mm</span>
          <span>{LENGTH_MAX_MM / 1000} m</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onLengthChange(preset)}
              className={`border px-3 py-1.5 font-mono text-xs transition-colors ${
                lengthMm === preset
                  ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                  : 'border-steel-700 text-steel-400 hover:border-steel-400 hover:text-steel-200'
              }`}
            >
              {preset} mm
            </button>
          ))}
        </div>
      </div>

      <div className="border border-steel-700 bg-steel-900 p-5">
        <span className="mb-3 block text-sm font-bold uppercase tracking-wide text-steel-200">
          Ilość sztuk
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Zmniejsz ilość"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="flex h-12 w-12 shrink-0 items-center justify-center border border-steel-600 text-steel-200 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="flex-1 border border-steel-600 bg-steel-950 py-3 text-center font-mono text-2xl font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Zwiększ ilość"
            onClick={() => onQuantityChange(Math.min(99, quantity + 1))}
            className="flex h-12 w-12 shrink-0 items-center justify-center border border-steel-600 text-steel-200 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-steel-500">
          Wszystkie sztuki zostaną wykonane wg tej samej specyfikacji.
        </p>
      </div>
    </div>
  )
}
