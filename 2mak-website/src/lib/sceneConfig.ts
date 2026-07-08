/**
 * Konfiguracja "scenariusza" strony — jedno źródło prawdy dla:
 *  - waypointów kamery (pozycja + punkt patrzenia) w wirtualnej hali,
 *  - zakresów scrolla przypisanych do poszczególnych scen,
 *  - identyfikatorów sekcji HTML (overlay UI).
 *
 * Oś Z hali: kamera "wjeżdża w głąb" wraz z malejącym Z.
 * Wszystkie wartości są celowo trzymane w jednym pliku, aby reżyseria
 * ujęć była edytowalna bez dotykania logiki komponentów.
 */

export interface CameraWaypoint {
  /** Pozycja kamery w przestrzeni świata. */
  position: [number, number, number];
  /** Punkt, na który kamera patrzy (animowany niezależnie od pozycji). */
  target: [number, number, number];
  /** Pole widzenia — lekkie zmiany FOV dodają "filmowości" ujęciom. */
  fov: number;
}

export interface SceneDefinition {
  id: string;
  /** Nazwa robocza sceny (debug / markery ScrollTriggera). */
  label: string;
  /** Ujęcie kamery na końcu tej sceny. */
  camera: CameraWaypoint;
  /**
   * Udział sceny w całkowitej długości scrolla (wagi są normalizowane).
   * Scena 2 (Exploded View) dostaje więcej "przestrzeni scrollowej",
   * bo rozsuwanie złożenia potrzebuje czasu na wybrzmienie.
   */
  scrollWeight: number;
}

/** Ujęcie startowe (Scena 0 — Hero, szeroki kąt na halę). */
export const INITIAL_CAMERA: CameraWaypoint = {
  position: [0, 3.2, 14],
  target: [0, 2.2, 0],
  fov: 45,
};

export const SCENES: SceneDefinition[] = [
  {
    id: "scene-1-cad",
    label: "Projektowanie CAD",
    // Kamera wjeżdża w głąb hali, do pierwszego stanowiska (lewa strona).
    camera: { position: [1.6, 1.9, 6.5], target: [-1.2, 1.6, 3.5], fov: 42 },
    scrollWeight: 1,
  },
  {
    id: "scene-2-print",
    label: "Druk 3D i prototypowanie",
    // Dojazd do stanowiska z robotem SCARA; tu odbywa się Exploded View.
    camera: { position: [2.4, 1.7, -0.5], target: [0, 1.2, -4], fov: 40 },
    scrollWeight: 1.6,
  },
  {
    id: "scene-3-machines",
    label: "Budowa maszyn",
    // Obrót o ~90°: kamera przechodzi na bok stanowiska montażowego.
    camera: { position: [-4.5, 1.6, -4.2], target: [0.5, 1.0, -4.5], fov: 42 },
    scrollWeight: 1.2,
  },
  {
    id: "scene-4-contact",
    label: "Finalizacja i kontakt",
    // Wzniesienie — widok z lotu ptaka na całą przebytą linię montażową.
    camera: { position: [0, 12, 2], target: [0, 0, -2], fov: 50 },
    scrollWeight: 1,
  },
];

/** Waga scrolla sekcji Hero (zanim kamera ruszy z ujęcia startowego). */
export const HERO_SCROLL_WEIGHT = 0.6;

/** Łączna wysokość strony w jednostkach 100vh (Hero + sceny). */
export const TOTAL_SCROLL_VIEWPORTS = 6;

/**
 * Zakresy postępu (0..1) poszczególnych scen na globalnej osi scrolla.
 * Wykorzystywane zarówno przez timeline kamery, jak i przez fade-in tekstów.
 */
export function computeSceneRanges() {
  const weights = [HERO_SCROLL_WEIGHT, ...SCENES.map((s) => s.scrollWeight)];
  const total = weights.reduce((a, b) => a + b, 0);
  let cursor = 0;
  return weights.map((w) => {
    const start = cursor;
    cursor += w / total;
    return { start, end: cursor };
  });
}
