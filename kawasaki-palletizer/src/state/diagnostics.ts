import { APP_NAME, APP_VERSION } from '../core/defaults'

export interface LogEntry {
  time: string
  level: 'info' | 'error'
  message: string
  details?: string
}

const STORAGE_KEY = 'kawasaki-palletizer:log'
const MAX_ENTRIES = 200

let entries: LogEntry[] = load()
const listeners = new Set<() => void>()
let errorNotifier: ((entry: LogEntry) => void) | null = null

function load(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as LogEntry[]).slice(-MAX_ENTRIES) : []
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Brak miejsca lub zablokowany magazyn – log pozostaje w pamięci.
  }
  listeners.forEach((l) => l())
}

export function logInfo(message: string) {
  entries = [...entries, { time: new Date().toISOString(), level: 'info' as const, message }].slice(-MAX_ENTRIES)
  persist()
}

export function logError(error: unknown, context?: string) {
  const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error))
  const entry: LogEntry = {
    time: new Date().toISOString(),
    level: 'error',
    message: context ? `${context}: ${err.message}` : err.message,
    details: err.stack,
  }
  entries = [...entries, entry].slice(-MAX_ENTRIES)
  persist()
  errorNotifier?.(entry)
}

export function getLog(): LogEntry[] {
  return entries
}

export function clearLog() {
  entries = []
  persist()
}

export function subscribeLog(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Każdy nieobsłużony błąd trafia do logu użytkownika i jest zgłaszany w interfejsie. */
export function installGlobalErrorHandlers(notify: (entry: LogEntry) => void) {
  errorNotifier = notify
  window.addEventListener('error', (event) => {
    // Błędy ładowania zasobów i szum ResizeObserver nie są błędami aplikacji.
    if (!event.error && /ResizeObserver/.test(event.message)) return
    logError(event.error ?? event.message, 'Nieobsłużony błąd')
  })
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, 'Nieobsłużone odrzucenie')
  })
}

export function environmentInfo(): string {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  return [
    `${APP_NAME} ${APP_VERSION}`,
    `Przeglądarka: ${nav?.userAgent ?? 'nieznana'}`,
    `Język: ${nav?.language ?? '–'}`,
    `Okno: ${typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x` : '–'}`,
    `Adres: ${typeof location !== 'undefined' ? location.protocol : '–'}`,
  ].join('\n')
}

export function logAsText(): string {
  const lines = entries.map((e) => `[${e.time}] ${e.level.toUpperCase()} ${e.message}${e.details ? '\n' + e.details : ''}`)
  return `${environmentInfo()}\n\n${lines.join('\n')}\n`
}
