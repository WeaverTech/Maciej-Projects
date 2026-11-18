/** Łączy nazwy klas CSS, pomijając wartości puste. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
