import {
  ANGLE_SURCHARGE,
  CRIMP_PRICE_PER_END,
  CUTTING_PRICE,
  DN_FITTING_MULTIPLIER,
  ORIENTATION_SURCHARGE,
  VAT_RATE,
  getFittingFamily,
  getHoseType,
} from '../data/catalog'
import type { DnId, FittingAngle, FittingFamilyId, HoseTypeId } from '../data/catalog'

export interface EndConfig {
  family: FittingFamilyId
  angle: FittingAngle
}

/** Pełna specyfikacja jednego węża z konfiguratora */
export interface HoseConfig {
  hoseType: HoseTypeId
  dn: DnId
  lengthMm: number
  endA: EndConfig
  endB: EndConfig
  /** kąt skręcenia końcówek względem siebie [°] – istotny, gdy obie końcówki są kątowe */
  orientationDeg: number
  quantity: number
}

export interface PriceLine {
  label: string
  detail?: string
  net: number
}

export interface PriceBreakdown {
  lines: PriceLine[]
  /** netto za 1 szt. */
  unitNet: number
  quantity: number
  totalNet: number
  vat: number
  totalGross: number
}

const round2 = (v: number) => Math.round(v * 100) / 100

export function fittingPrice(dn: DnId, end: EndConfig): number {
  const family = getFittingFamily(end.family)
  return round2(family.basePrice * DN_FITTING_MULTIPLIER[dn] + ANGLE_SURCHARGE[end.angle])
}

export function orientationRelevant(config: Pick<HoseConfig, 'endA' | 'endB'>): boolean {
  return config.endA.angle !== 0 && config.endB.angle !== 0
}

/**
 * Wycena konfiguracji. Logika mockowana – odwzorowuje realną strukturę
 * kosztów: wąż na metry + końcówki + usługa zakucia + docięcie.
 */
export function calculatePrice(config: HoseConfig): PriceBreakdown {
  const hose = getHoseType(config.hoseType)
  const perMeter = hose.pricePerMeter[config.dn] ?? 0
  const meters = config.lengthMm / 1000

  const lines: PriceLine[] = [
    {
      label: `Wąż ${hose.id} ${config.dn}`,
      detail: `${meters.toFixed(2)} mb × ${perMeter.toFixed(2)} zł`,
      net: round2(perMeter * meters),
    },
    {
      label: `Końcówka A: ${config.endA.family}`,
      detail: config.endA.angle === 0 ? 'prosta' : `kolanko ${config.endA.angle}°`,
      net: fittingPrice(config.dn, config.endA),
    },
    {
      label: `Końcówka B: ${config.endB.family}`,
      detail: config.endB.angle === 0 ? 'prosta' : `kolanko ${config.endB.angle}°`,
      net: fittingPrice(config.dn, config.endB),
    },
    {
      label: 'Zakucie końcówek',
      detail: `2 × ${CRIMP_PRICE_PER_END.toFixed(2)} zł`,
      net: CRIMP_PRICE_PER_END * 2,
    },
    { label: 'Docięcie na wymiar', net: CUTTING_PRICE },
  ]

  if (orientationRelevant(config) && config.orientationDeg !== 0) {
    lines.push({
      label: 'Ustawienie kąta skręcenia',
      detail: `${config.orientationDeg}°`,
      net: ORIENTATION_SURCHARGE,
    })
  }

  const unitNet = round2(lines.reduce((sum, l) => sum + l.net, 0))
  const totalNet = round2(unitNet * config.quantity)
  const vat = round2(totalNet * VAT_RATE)
  const totalGross = round2(totalNet + vat)

  return { lines, unitNet, quantity: config.quantity, totalNet, vat, totalGross }
}

export function formatPln(value: number): string {
  return value.toLocaleString('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
  })
}
