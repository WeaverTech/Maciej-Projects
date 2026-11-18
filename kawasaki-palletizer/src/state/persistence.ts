import { parseProject, serializeProject } from '../core/projectIo'
import type { Project } from '../core/types'

const AUTOSAVE_KEY = 'kawasaki-palletizer:autosave'
const PREFS_KEY = 'kawasaki-palletizer:prefs'

/** Ustawienia interfejsu zapamiętywane między sesjami. */
export interface Prefs {
  theme: 'light' | 'dark' | 'system'
  grid: boolean
  gridStep: number
  snap: boolean
  /** Podgląd drugiej warstwy pod aktywną. */
  showGhost: boolean
  coordMode: 'board' | 'base'
  showDimensions: boolean
}

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  grid: true,
  gridStep: 50,
  snap: true,
  showGhost: false,
  coordMode: 'board',
  showDimensions: true,
}

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const data = JSON.parse(raw) as Partial<Prefs>
    return {
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : 'system',
      grid: typeof data.grid === 'boolean' ? data.grid : DEFAULT_PREFS.grid,
      gridStep: typeof data.gridStep === 'number' && data.gridStep > 0 ? data.gridStep : DEFAULT_PREFS.gridStep,
      snap: typeof data.snap === 'boolean' ? data.snap : DEFAULT_PREFS.snap,
      showGhost: typeof data.showGhost === 'boolean' ? data.showGhost : DEFAULT_PREFS.showGhost,
      coordMode: data.coordMode === 'base' ? 'base' : 'board',
      showDimensions: typeof data.showDimensions === 'boolean' ? data.showDimensions : DEFAULT_PREFS.showDimensions,
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Magazyn niedostępny – ustawienia obowiązują tylko w tej sesji.
  }
}

export interface Autosave {
  project: Project
  fileName: string | null
  dirty: boolean
}

export function loadAutosave(): Autosave | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { project?: unknown; fileName?: unknown; dirty?: unknown }
    return {
      project: parseProject(data.project),
      fileName: typeof data.fileName === 'string' ? data.fileName : null,
      dirty: data.dirty !== false,
    }
  } catch {
    return null
  }
}

export function saveAutosave(project: Project, fileName: string | null, dirty: boolean) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, `{"fileName":${JSON.stringify(fileName)},"dirty":${dirty},"project":${serializeProject(project)}}`)
  } catch {
    // Brak miejsca w magazynie – pomijamy autozapis.
  }
}

export function hasAutosave(): boolean {
  try {
    return localStorage.getItem(AUTOSAVE_KEY) !== null
  } catch {
    return false
  }
}
