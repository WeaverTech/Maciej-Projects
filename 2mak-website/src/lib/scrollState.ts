/**
 * Współdzielony, mutowalny stan animacji scrollowej.
 *
 * Wzorzec: GSAP (poza pętlą renderowania R3F) tweenuje pola tego obiektu,
 * a komponenty 3D odczytują je w `useFrame` — bez re-renderów Reacta
 * przy każdej klatce (60 fps). To standardowa, wydajna integracja
 * GSAP ScrollTrigger + react-three-fiber.
 */
export const scrollState = {
  /** Globalny postęp scrolla całej strony: 0..1. */
  progress: 0,

  /**
   * Postęp efektu Exploded View robota SCARA: 0 (złożony) .. 1 (rozsunięty).
   * Scena 2 tweenuje do 1, Scena 3 z powrotem do 0 ("złożenie zjeżdża się").
   */
  scaraExplode: 0,

  /** Intensywność Depth of Field w Scenie 4 (0 = brak rozmycia). */
  dofIntensity: 0,

  /** Obrót logo 2MaK w Hero (radiany) — subtelny ruch "idle". */
  logoSpin: 0,
};

export type ScrollState = typeof scrollState;
