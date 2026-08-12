import { useState } from 'react'
import { Cable } from 'lucide-react'

interface BrandLogoProps {
  /** klasy rozmiaru, np. "h-12 w-12" */
  className?: string
}

/**
 * Logo firmowe – ładuje public/logo.png; gdy pliku brak,
 * wyświetla techniczny znak zastępczy.
 */
export default function BrandLogo({ className = 'h-11 w-11' }: BrandLogoProps) {
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
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt="Logo Prima-Hydro"
      className={`shrink-0 object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
