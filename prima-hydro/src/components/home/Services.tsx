import { Factory, HardHat, Scissors, Tractor, Truck, Wrench } from 'lucide-react'

const SERVICES = [
  {
    icon: Wrench,
    title: 'Zakuwanie węży na wymiar',
    description:
      'Węże 1SN, 2SN i 4SP z końcówkami DKOL, DKOS, DKR i ORFS. Zakucie na prasie z pełną kontrolą tulei.',
  },
  {
    icon: Scissors,
    title: 'Naprawa i regeneracja',
    description:
      'Odtwarzamy przewody 1:1 na podstawie uszkodzonego wzoru – wystarczy przywieźć stary wąż.',
  },
  {
    icon: Truck,
    title: 'Serwis mobilny 24/7',
    description:
      'Awaria w polu lub na budowie? Dojeżdżamy z mobilną zakuwarką w promieniu 50 km.',
  },
]

const INDUSTRIES = [
  {
    icon: Tractor,
    title: 'Rolnictwo',
    description: 'Ciągniki, kombajny, prasy, ładowacze czołowe, przyczepy wywrotki.',
  },
  {
    icon: HardHat,
    title: 'Budownictwo',
    description: 'Koparki, ładowarki, młoty hydrauliczne, żurawie, pompy do betonu.',
  },
  {
    icon: Factory,
    title: 'Przemysł',
    description: 'Prasy, wtryskarki, linie produkcyjne, hydraulika siłowa maszyn.',
  },
]

export default function Services() {
  return (
    <section id="uslugi" className="border-b border-steel-800 bg-steel-950">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-brand-500">
            // Zakres usług
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Co robimy
          </h2>
        </div>

        <div className="grid gap-px border border-steel-800 bg-steel-800 md:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group relative bg-steel-900 p-8 transition-colors hover:bg-steel-850"
            >
              <span className="absolute left-0 top-0 h-full w-1 bg-steel-800 transition-colors group-hover:bg-brand-500" />
              <Icon className="mb-5 h-9 w-9 text-brand-500" />
              <h3 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-steel-400">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 mb-12">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-brand-500">
            // Branże
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Dla kogo pracujemy
          </h2>
        </div>

        <div className="grid gap-px border border-steel-800 bg-steel-800 md:grid-cols-3">
          {INDUSTRIES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="flex items-start gap-4 bg-steel-900 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-hazard-500/40 bg-hazard-500/10">
                <Icon className="h-6 w-6 text-hazard-400" />
              </div>
              <div>
                <h3 className="mb-1 font-bold uppercase tracking-wide text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-steel-400">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
