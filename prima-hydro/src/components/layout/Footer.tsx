import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import BrandLogo from '../ui/BrandLogo'

export default function Footer() {
  return (
    <footer id="kontakt" className="border-t border-steel-800 bg-steel-900">
      <div className="hazard-stripes h-1.5" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <BrandLogo className="h-10 w-10" />
            <span className="text-lg font-black uppercase tracking-widest text-white">
              Prima<span className="text-brand-500">-Hydro</span>
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-steel-400">
            Profesjonalne zakuwanie węży hydraulicznych dla rolnictwa, budownictwa i przemysłu.
            Węże na wymiar w kilkanaście minut – od DN6 do DN25, do 450 bar.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-hazard-400">
            Kontakt
          </h3>
          <ul className="space-y-3 text-sm text-steel-300">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-brand-500" />
              <a href="tel:+48606478677" className="font-mono hover:text-brand-400">
                +48 606 478 677
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-brand-500" />
              <a href="mailto:biuro@prima-hydro.pl" className="hover:text-brand-400">
                biuro@prima-hydro.pl
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>
                Błagodać 1B
                <br />
                26-234 Mnin
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-hazard-400">
            Godziny otwarcia
          </h3>
          <ul className="space-y-2 text-sm text-steel-300">
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-brand-500" />
              pn–pt: 7:00–17:00
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-brand-500" />
              sobota: 8:00–13:00
            </li>
            <li className="mt-4 border border-hazard-500/40 bg-hazard-500/10 px-3 py-2 font-mono text-xs text-hazard-400">
              AWARIE 24/7 – dojazd do klienta
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-steel-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-steel-600">
          <span>© {new Date().getFullYear()} Prima-Hydro. Wszystkie prawa zastrzeżone.</span>
          <Link to="/admin" className="transition-colors hover:text-steel-400">
            Panel
          </Link>
        </div>
      </div>
    </footer>
  )
}
