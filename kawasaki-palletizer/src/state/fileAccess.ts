/**
 * Otwieranie i zapisywanie plików. W przeglądarkach z File System Access API (Chrome, Edge)
 * „Zapisz” nadpisuje ten sam plik; w pozostałych plik jest pobierany.
 */

export interface FileHandleLike {
  name: string
  createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }>
  getFile: () => Promise<File>
}

interface PickerType {
  description: string
  accept: Record<string, string[]>
}

interface PickerWindow {
  showOpenFilePicker?: (options: { types: PickerType[]; multiple?: boolean }) => Promise<FileHandleLike[]>
  showSaveFilePicker?: (options: { suggestedName: string; types: PickerType[] }) => Promise<FileHandleLike>
}

const picker = (): PickerWindow => window as unknown as PickerWindow

export const PROJECT_TYPES: PickerType[] = [{ description: 'Projekt Kawasaki Palletizer', accept: { 'application/json': ['.json'] } }]
export const AS_TYPES: PickerType[] = [{ description: 'Program Kawasaki AS', accept: { 'text/plain': ['.as', '.pg', '.txt'] } }]

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export interface OpenedFile {
  name: string
  text: string
  handle: FileHandleLike | null
}

/** Zwraca `null`, gdy użytkownik anulował wybór pliku. */
export async function openTextFile(types: PickerType[]): Promise<OpenedFile | null> {
  const open = picker().showOpenFilePicker
  if (open) {
    try {
      const [handle] = await open({ types, multiple: false })
      const file = await handle.getFile()
      return { name: file.name, text: await file.text(), handle }
    } catch (error) {
      if (isAbort(error)) return null
      throw error
    }
  }
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = types.flatMap((t) => Object.values(t.accept).flat()).join(',')
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      file.text().then((text) => resolve({ name: file.name, text, handle: null }), reject)
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

export interface SavedFile {
  name: string
  handle: FileHandleLike | null
}

/**
 * Zapisuje tekst do pliku. Gdy podano `handle`, nadpisuje ten plik bez pytania.
 * Zwraca `null`, gdy użytkownik anulował okno zapisu.
 */
export async function saveTextFile(
  text: string,
  suggestedName: string,
  types: PickerType[],
  handle: FileHandleLike | null = null,
): Promise<SavedFile | null> {
  const save = picker().showSaveFilePicker
  if (handle || save) {
    try {
      const target = handle ?? (await save!({ suggestedName, types }))
      const writable = await target.createWritable()
      await writable.write(text)
      await writable.close()
      return { name: target.name, handle: target }
    } catch (error) {
      if (isAbort(error)) return null
      if (handle) throw error
      // Okno zapisu niedostępne (np. w ramce) – awaryjnie pobierz plik.
    }
  }
  downloadText(text, suggestedName)
  return { name: suggestedName, handle: null }
}

export function downloadText(text: string, fileName: string, mime = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Przechodzimy do metody zastępczej.
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}
