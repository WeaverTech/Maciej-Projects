import { useState } from 'react'
import { Cable } from 'lucide-react'

interface BrandLogoProps {
  /** klasy rozmiaru, np. "h-12 w-12" */
  className?: string
}

/**
 * Logo firmowe – ładuje public/logo.webp (z fallbackiem PNG).
 * Gdy pliku brak, wyświetla techniczny znak zastępczy.
 */
export default function BrandLogo({ className = 'h-16 w-16' }: BrandLogoProps) {
  const [src, setSrc] = useState(`${import.meta.env.BASE_URL}logo.webp`)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center border-2 border-brand-500 bg-steel-900 ${className}`}
      >
        <Cable className="h-3/5 w-3/5 text-brand-500" />
        <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-hazard-400" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="Logo Prima-Hydro – zakuwanie węży hydraulicznych"
      className={`shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] ${className}`}
      onError={() => {
        const png = `${import.meta.env.BASE_URL}logo.png`
        if (src !== png) setSrc(png)
        else setFailed(true)
      }}
    />
  )
}
