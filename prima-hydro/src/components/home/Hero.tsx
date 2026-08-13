import { ArrowRight, Gauge, ShieldCheck, Timer, Wrench } from 'lucide-react'
import BrandLogo from '../ui/BrandLogo'

const STATS = [
  { icon: Gauge, value: '450 bar', label: 'maks. ciśnienie robocze' },
  { icon: Timer, value: '15 min', label: 'średni czas realizacji' },
  { icon: Wrench, value: 'DN6–DN25', label: 'pełen zakres średnic' },
  { icon: ShieldCheck, value: 'EN 853/856', label: 'zgodność z normami' },
]

export default function Hero() {
  return (
    <section className="blueprint-grid relative overflow-hidden border-b border-steel-800 bg-steel-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 hazard-stripes" />

      <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 border border-hazard-500/50 bg-hazard-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-hazard-400">
              Rolnictwo · Budownictwo · Przemysł
            </p>
            <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Zakuwanie węży
              <br />
              hydraulicznych{' '}
              <span className="text-brand-500">na&nbsp;wymiar</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel-300">
              Awaria siłownika w żniwa? Pęknięty przewód w koparce? Skonfiguruj wąż online,
              poznaj cenę od ręki i odbierz gotowy przewód tego samego dnia.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#konfigurator"
                className="group inline-flex items-center gap-2 bg-brand-500 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-steel-950 transition-colors hover:bg-brand-400"
              >
                Skonfiguruj wąż
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#uslugi"
                className="inline-flex items-center gap-2 border border-steel-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-steel-200 transition-colors hover:border-brand-500 hover:text-brand-400"
              >
                Zobacz usługi
              </a>
            </div>
          </div>

          <div className="mx-auto hidden lg:block">
            <BrandLogo className="h-56 w-56 xl:h-64 xl:w-64" />
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px border border-steel-800 bg-steel-800 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-steel-900 p-5">
              <Icon className="mb-3 h-6 w-6 text-brand-500" />
              <dt className="order-last mt-1 text-xs uppercase tracking-wide text-steel-400">
                {label}
              </dt>
              <dd className="font-mono text-2xl font-bold text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
