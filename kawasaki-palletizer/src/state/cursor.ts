import { create } from 'zustand'

/** Ulotny stan edytora 2D (pozycja kursora, powiększenie, pomiar) – poza historią projektu. */
interface CursorState {
  x: number | null
  y: number | null
  zoom: number
  measure: { dx: number; dy: number; length: number } | null
  setCursor: (x: number | null, y: number | null) => void
  setZoom: (zoom: number) => void
  setMeasure: (measure: CursorState['measure']) => void
}

export const useCursor = create<CursorState>((set) => ({
  x: null,
  y: null,
  zoom: 1,
  measure: null,
  setCursor: (x, y) => set({ x, y }),
  setZoom: (zoom) => set({ zoom }),
  setMeasure: (measure) => set({ measure }),
}))
