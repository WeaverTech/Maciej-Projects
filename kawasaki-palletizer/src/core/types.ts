/**
 * Modele projektu. Wszystkie wartości geometrii są w milimetrach.
 *
 * Układ planszy (edytora): początek w narożniku A (lewy górny), +x w prawo, +y w dół.
 * Pozycja produktu oznacza ŚRODEK prostokątnego obrysu.
 * Narożniki palety: A – lewy górny, B – prawy górny, C – prawy dolny, D – lewy dolny.
 */

export type Corner = 'A' | 'B' | 'C' | 'D'
export type Direction = 'prawo' | 'lewo' | 'gora' | 'dol'
export type ProductKind = 'worek' | 'karton'
export type PickMode = 'pojedynczy' | 'podwojny'
export type LayerName = 'A' | 'B'

/** Obrót produktu w stopniach, przeciwnie do ruchu wskazówek zegara patrząc z góry. */
export type Rotation = 0 | 90 | 180 | 270

export interface Pallet {
  length: number
  width: number
  baseCorner: Corner
  xDirection: Direction
  yDirection: Direction
}

export interface Product {
  kind: ProductKind
  length: number
  width: number
  height: number
  /** Przyrost wysokości na warstwę (zwykle wysokość produktu po ułożeniu). */
  layerIncrement: number
  allowOverhang: boolean
  maxOverhang: number
  allowOverlap: boolean
  maxOverlap: number
}

export interface Placement {
  id: number
  x: number
  y: number
  rotation: Rotation
  /** Numer produktu w kolejności układania (1..n), wspólny dla szablonów A i B. */
  order: number
}

export interface Layer {
  name: LayerName
  items: Placement[]
  /** Warstwa B powiązana z A: pozycje są wyliczane automatycznie jako obrót A o 180°. */
  link: 'rot180' | null
}

export interface SlipSheet {
  enabled: boolean
  thickness: number
  /** Przekładka po każdych N warstwach. */
  every: number
  /** Opcjonalna nazwa podprogramu AS wywoływanego w miejscu przekładki. */
  callProgram: string
}

export type OrientationMode = 'base' | 'legacy'

export interface Robot {
  programName: string
  baseName: string
  pickup: string
  pickupApproach: string
  layers: number
  firstZ: number
  safeZ: number
  speed: number
  accel: number
  decel: number
  pickMode: PickMode
  s1Name: string
  s1On: string
  s1Off: string
  s2Name: string
  s2On: string
  s2Off: string
  /** Cykle chwytu podwójnego w formacie `produkt=sekcja,produkt=sekcja;...`. */
  assignments: string
  gripWait: number
  releaseWait: number
  /**
   * `base`   – kąt O liczony w układzie BASE (uwzględnia kierunki osi),
   * `legacy` – kąt z planszy bez przeliczenia (zgodność z wersją 2.3).
   */
  orientationMode: OrientationMode
  oOffset: number
}

export interface Project {
  version: 4
  name: string
  pallet: Pallet
  product: Product
  layers: { A: Layer; B?: Layer }
  robot: Robot
  slipSheet: SlipSheet
}

export type Severity = 'error' | 'warning' | 'info'

export type IssueScope = 'geometry' | 'order' | 'axes' | 'gripper' | 'robot' | 'layers' | 'as'

export interface Issue {
  id: string
  severity: Severity
  scope: IssueScope
  message: string
  /** Warstwa, której dotyczy problem (dla zaznaczania produktów). */
  layer?: LayerName
  itemIds?: number[]
  /** Identyfikator szybkiej poprawki dostępnej w interfejsie. */
  /** Powtórzenie problemu warstwy A w powiązanej warstwie B – służy tylko do kolorowania, nie jest liczone ani listowane. */
  mirrored?: boolean
  fix?: 'auto-pair' | 'renumber' | 'relink-b'
}

export interface Rect {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface Point {
  x: number
  y: number
}
