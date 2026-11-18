/** Polska odmiana rzeczownika przy liczebniku: plural(5, 'produkt', 'produkty', 'produktów'). */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  if (abs === 1) return one
  const d = abs % 10
  const h = abs % 100
  if (d >= 2 && d <= 4 && !(h >= 12 && h <= 14)) return few
  return many
}

export const countLabel = (n: number, one: string, few: string, many: string) => `${n} ${plural(n, one, few, many)}`

export const productsLabel = (n: number) => countLabel(n, 'produkt', 'produkty', 'produktów')
export const errorsLabel = (n: number) => countLabel(n, 'błąd', 'błędy', 'błędów')
export const warningsLabel = (n: number) => countLabel(n, 'ostrzeżenie', 'ostrzeżenia', 'ostrzeżeń')
export const layersLabel = (n: number) => countLabel(n, 'warstwa', 'warstwy', 'warstw')
export const cyclesLabel = (n: number) => countLabel(n, 'cykl', 'cykle', 'cykli')

/** Liczba do wyświetlenia w interfejsie: przecinek dziesiętny, bez zbędnych zer. */
export function formatMm(v: number, digits = 1): string {
  if (!Number.isFinite(v)) return '–'
  const f = 10 ** digits
  const r = Math.round(v * f) / f
  return (Object.is(r, -0) ? 0 : r).toLocaleString('pl-PL', { maximumFractionDigits: digits, useGrouping: false })
}

export function formatPercent(v: number): string {
  return `${Math.round(v * 100)}%`
}
