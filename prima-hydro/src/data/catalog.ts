/**
 * Katalog techniczny Prima-Hydro.
 * Ceny są mockowane (PLN netto) – docelowo do podpięcia pod API/ERP.
 */

export type HoseTypeId = '1SN' | '2SN' | '4SP'
export type DnId = 'DN6' | 'DN8' | 'DN10' | 'DN12' | 'DN16' | 'DN19' | 'DN25'
export type FittingFamilyId = 'DKOL' | 'DKOS' | 'DKR' | 'ORFS'
export type FittingAngle = 0 | 45 | 90

export interface HoseType {
  id: HoseTypeId
  norm: string
  name: string
  description: string
  reinforcement: string
  /** cena netto za metr bieżący [PLN] wg średnicy */
  pricePerMeter: Partial<Record<DnId, number>>
  /** maks. ciśnienie robocze [bar] wg średnicy */
  workingPressure: Partial<Record<DnId, number>>
}

export interface DnSize {
  id: DnId
  /** średnica wewnętrzna [mm] */
  innerMm: number
  inch: string
}

export interface FittingFamily {
  id: FittingFamilyId
  name: string
  thread: string
  description: string
  /** cena bazowa netto [PLN] dla DN6 – skalowana mnożnikiem średnicy */
  basePrice: number
}

export const HOSE_TYPES: HoseType[] = [
  {
    id: '1SN',
    norm: 'EN 853 1SN',
    name: 'Wąż 1SN – 1 oplot stalowy',
    description:
      'Uniwersalny wąż średniociśnieniowy z jednym oplotem z drutu stalowego. Hydraulika siłowa maszyn rolniczych i osprzętu.',
    reinforcement: '1 × oplot stalowy',
    pricePerMeter: { DN6: 14, DN8: 16, DN10: 18, DN12: 22, DN16: 28, DN19: 34, DN25: 46 },
    workingPressure: { DN6: 225, DN8: 215, DN10: 180, DN12: 160, DN16: 130, DN19: 105, DN25: 88 },
  },
  {
    id: '2SN',
    norm: 'EN 853 2SN',
    name: 'Wąż 2SN – 2 oploty stalowe',
    description:
      'Wąż wysokociśnieniowy z podwójnym oplotem stalowym. Standard w maszynach budowlanych, ładowarkach i ciągnikach.',
    reinforcement: '2 × oplot stalowy',
    pricePerMeter: { DN6: 18, DN8: 21, DN10: 24, DN12: 29, DN16: 38, DN19: 47, DN25: 62 },
    workingPressure: { DN6: 400, DN8: 350, DN10: 330, DN12: 275, DN16: 250, DN19: 215, DN25: 165 },
  },
  {
    id: '4SP',
    norm: 'EN 856 4SP',
    name: 'Wąż 4SP – 4 oploty spiralne',
    description:
      'Wąż bardzo wysokociśnieniowy z czterema oplotami spiralnymi. Ciężki przemysł, młoty hydrauliczne, prasy.',
    reinforcement: '4 × oplot spiralny',
    pricePerMeter: { DN6: 32, DN10: 39, DN12: 46, DN16: 58, DN19: 72, DN25: 95 },
    workingPressure: { DN6: 450, DN10: 445, DN12: 415, DN16: 350, DN19: 350, DN25: 280 },
  },
]

export const DN_SIZES: DnSize[] = [
  { id: 'DN6', innerMm: 6.4, inch: '1/4"' },
  { id: 'DN8', innerMm: 7.9, inch: '5/16"' },
  { id: 'DN10', innerMm: 9.5, inch: '3/8"' },
  { id: 'DN12', innerMm: 12.7, inch: '1/2"' },
  { id: 'DN16', innerMm: 15.9, inch: '5/8"' },
  { id: 'DN19', innerMm: 19.0, inch: '3/4"' },
  { id: 'DN25', innerMm: 25.4, inch: '1"' },
]

/** Mnożnik ceny końcówki względem średnicy węża */
export const DN_FITTING_MULTIPLIER: Record<DnId, number> = {
  DN6: 1.0,
  DN8: 1.1,
  DN10: 1.2,
  DN12: 1.35,
  DN16: 1.6,
  DN19: 1.9,
  DN25: 2.4,
}

export const FITTING_FAMILIES: FittingFamily[] = [
  {
    id: 'DKOL',
    name: 'DKOL',
    thread: 'Metryczny, stożek 24°, o-ring (seria lekka)',
    description: 'Najpopularniejsza końcówka w maszynach rolniczych.',
    basePrice: 9,
  },
  {
    id: 'DKOS',
    name: 'DKOS',
    thread: 'Metryczny, stożek 24°, o-ring (seria ciężka)',
    description: 'Do układów wysokociśnieniowych i maszyn budowlanych.',
    basePrice: 12,
  },
  {
    id: 'DKR',
    name: 'DKR',
    thread: 'Calowy BSP, stożek 60°',
    description: 'Uniwersalny gwint calowy – hydraulika siłowa i przemysł.',
    basePrice: 10,
  },
  {
    id: 'ORFS',
    name: 'ORFS',
    thread: 'Calowy UNF, uszczelnienie czołowe o-ring',
    description: 'Szczelność premium – maszyny CAT, JCB, Komatsu.',
    basePrice: 16,
  },
]

/** Dopłata netto [PLN] za kolanko końcówki */
export const ANGLE_SURCHARGE: Record<FittingAngle, number> = {
  0: 0,
  45: 7,
  90: 11,
}

export const FITTING_ANGLES: { value: FittingAngle; label: string }[] = [
  { value: 0, label: 'Prosta' },
  { value: 45, label: 'Kolanko 45°' },
  { value: 90, label: 'Kolanko 90°' },
]

/** Usługi stałe (netto) */
export const CRIMP_PRICE_PER_END = 8 // zakucie jednej końcówki
export const CUTTING_PRICE = 3 // docięcie węża na wymiar
export const ORIENTATION_SURCHARGE = 5 // ustawienie kąta skręcenia końcówek
export const VAT_RATE = 0.23

export const LENGTH_MIN_MM = 300
export const LENGTH_MAX_MM = 12000
export const LENGTH_STEP_MM = 10

/** Kąt skręcenia końcówek względem siebie (co 15°) */
export const ORIENTATION_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15)

export function getHoseType(id: HoseTypeId): HoseType {
  return HOSE_TYPES.find((h) => h.id === id)!
}

export function getDnSize(id: DnId): DnSize {
  return DN_SIZES.find((d) => d.id === id)!
}

export function getFittingFamily(id: FittingFamilyId): FittingFamily {
  return FITTING_FAMILIES.find((f) => f.id === id)!
}

/** Czy dana średnica jest dostępna dla danego typu węża */
export function isDnAvailable(hose: HoseTypeId, dn: DnId): boolean {
  return getHoseType(hose).pricePerMeter[dn] !== undefined
}
