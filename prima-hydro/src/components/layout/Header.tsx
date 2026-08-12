import { Link } from 'react-router-dom'
import { Cable, Clock, MapPin, Phone } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-steel-700 bg-steel-950/95 backdrop-blur">
      {/* Górna belka kontaktowa */}
      <div className="hidden border-b border-steel-800 bg-steel-900 text-xs text-steel-400 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand-500" />
              ul. Przemysłowa 12, 63-400 Ostrów Wielkopolski
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-500" />
              pn–pt 7:00–17:00, sob 8:00–13:00
            </span>
          </div>
          <span className="font-mono text-hazard-400">Serwis awaryjny 24/7</span>
        </div>
      </div>

      {/* Główna belka z logo i nawigacją */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center border-2 border-brand-500 bg-steel-900">
            <Cable className="h-6 w-6 text-brand-500" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-hazard-400" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-black uppercase tracking-widest text-white">
              Prima<span className="text-brand-500">-Hydro</span>
            </span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-steel-400">
              Zakuwanie węży hydraulicznych
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-wide text-steel-300 md:flex">
          <a href="/#uslugi" className="transition-colors hover:text-brand-400">
            Usługi
          </a>
          <a href="/#konfigurator" className="transition-colors hover:text-brand-400">
            Konfigurator
          </a>
          <a href="/#kontakt" className="transition-colors hover:text-brand-400">
            Kontakt
          </a>
        </nav>

        <a
          href="tel:+48601234567"
          className="flex items-center gap-2 border border-brand-500 bg-brand-500/10 px-4 py-2 text-sm font-bold text-brand-400 transition-colors hover:bg-brand-500 hover:text-steel-950"
        >
          <Phone className="h-4 w-4" />
          <span className="font-mono">+48 601 234 567</span>
        </a>
      </div>
    </header>
  )
}
