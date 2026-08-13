import { Cable } from 'lucide-react'

interface BrandLogoProps {
  className?: string
}

/** Techniczny znak Prima-Hydro – kwadrat z ikoną węża. */
export default function BrandLogo({ className = 'h-11 w-11' }: BrandLogoProps) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center border-2 border-brand-500 bg-steel-900 ${className}`}
    >
      <Cable className="h-3/5 w-3/5 text-brand-500" />
      <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-hazard-400" />
    </div>
  )
}
