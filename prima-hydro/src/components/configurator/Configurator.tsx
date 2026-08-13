import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, PlusCircle, Settings2 } from 'lucide-react'
import { isDnAvailable } from '../../data/catalog'
import type { DnId, HoseTypeId } from '../../data/catalog'
import type { EndConfig, HoseConfig } from '../../lib/pricing'
import { calculatePrice, formatPln } from '../../lib/pricing'
import { useOrderStore } from '../../store/orderStore'
import type { Customer } from '../../store/orderStore'
import StepIndicator from './StepIndicator'
import SpecPreview from './SpecPreview'
import OrderForm from './OrderForm'
import HoseTypeStep from './steps/HoseTypeStep'
import DiameterStep from './steps/DiameterStep'
import LengthStep from './steps/LengthStep'
import FittingsStep from './steps/FittingsStep'

const STEPS = ['Typ węża', 'Średnica', 'Długość', 'Końcówki', 'Zamówienie']

const DEFAULT_CONFIG: HoseConfig = {
  hoseType: '2SN',
  dn: 'DN10',
  lengthMm: 1000,
  endA: { family: 'DKOL', angle: 0 },
  endB: { family: 'DKOL', angle: 0 },
  orientationDeg: 0,
  quantity: 1,
}

export default function Configurator() {
  const [config, setConfig] = useState<HoseConfig>(DEFAULT_CONFIG)
  const [step, setStep] = useState(0)
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null)
  const addOrder = useOrderStore((state) => state.addOrder)

  const update = (patch: Partial<HoseConfig>) => setConfig((prev) => ({ ...prev, ...patch }))

  const handleHoseTypeChange = (hoseType: HoseTypeId) => {
    // 4SP nie występuje we wszystkich średnicach – w razie konfliktu przestaw na DN10
    const dn: DnId = isDnAvailable(hoseType, config.dn) ? config.dn : 'DN10'
    update({ hoseType, dn })
  }

  const handleSubmit = (customer: Customer) => {
    const order = addOrder({ customer, config, pricing: calculatePrice(config) })
    setConfirmedOrderId(order.id)
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    setStep(0)
    setConfirmedOrderId(null)
  }

  if (confirmedOrderId) {
    return (
      <section id="konfigurator" className="bg-steel-950">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-brand-500" />
          <h2 className="mb-3 text-3xl font-black uppercase tracking-tight text-white">
            Zamówienie przyjęte
          </h2>
          <p className="mb-2 text-steel-300">
            Numer zamówienia:{' '}
            <span className="font-mono font-bold text-hazard-400">{confirmedOrderId}</span>
          </p>
          <p className="mx-auto mb-8 max-w-md text-sm text-steel-400">
            Dziękujemy! Skontaktujemy się telefonicznie, aby potwierdzić specyfikację
            i termin odbioru węża.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 border border-brand-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-400 transition-colors hover:bg-brand-500 hover:text-steel-950"
          >
            <PlusCircle className="h-4 w-4" />
            Skonfiguruj kolejny wąż
          </button>
        </div>
      </section>
    )
  }

  const isLastStep = step === STEPS.length - 1
  const price = calculatePrice(config)

  return (
    <section id="konfigurator" className="bg-steel-950">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-8">
          <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-brand-500">
            <Settings2 className="h-4 w-4" />
            // Konfigurator online
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Zamów wąż na wymiar
          </h2>
          <p className="mt-3 max-w-2xl text-steel-400">
            Pięć kroków, wycena na żywo, zero dzwonienia w ciemno. Specyfikację i cenę widzisz
            cały czas w panelu podglądu.
          </p>
        </div>

        <StepIndicator steps={STEPS} current={step} onNavigate={setStep} />

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            {step === 0 && (
              <HoseTypeStep value={config.hoseType} onChange={handleHoseTypeChange} />
            )}
            {step === 1 && (
              <DiameterStep
                hoseType={config.hoseType}
                value={config.dn}
                onChange={(dn) => update({ dn })}
              />
            )}
            {step === 2 && (
              <LengthStep
                lengthMm={config.lengthMm}
                quantity={config.quantity}
                onLengthChange={(lengthMm) => update({ lengthMm })}
                onQuantityChange={(quantity) => update({ quantity })}
              />
            )}
            {step === 3 && (
              <FittingsStep
                dn={config.dn}
                endA={config.endA}
                endB={config.endB}
                orientationDeg={config.orientationDeg}
                onEndAChange={(endA: EndConfig) => update({ endA })}
                onEndBChange={(endB: EndConfig) => update({ endB })}
                onOrientationChange={(orientationDeg) => update({ orientationDeg })}
              />
            )}
            {step === 4 && <OrderForm onSubmit={handleSubmit} />}

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 border border-steel-600 px-5 py-3 text-sm font-bold uppercase tracking-wider text-steel-300 transition-colors hover:border-brand-500 hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                Wstecz
              </button>

              {!isLastStep && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="group inline-flex items-center gap-2 bg-brand-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-steel-950 transition-colors hover:bg-brand-400"
                >
                  {step === STEPS.length - 2
                    ? `Zamów za ${formatPln(price.totalGross)}`
                    : 'Dalej'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          </div>

          <SpecPreview config={config} />
        </div>
      </div>
    </section>
  )
}
