import { renderAs } from '../core/asExport'
import { createExampleProject } from '../core/example'
import { parseProjectJson, ProjectFormatError, serializeProject, suggestedFileName } from '../core/projectIo'
import { logError, logInfo } from './diagnostics'
import { AS_TYPES, copyText, openTextFile, PROJECT_TYPES, saveTextFile } from './fileAccess'
import { isDirty, useStore } from './store'

const state = () => useStore.getState()

function guardUnsaved(title: string, action: () => void) {
  const s = state()
  const empty = s.project.layers.A.items.length === 0 && !s.project.layers.B
  if (!isDirty(s) || empty) return action()
  s.askConfirm({
    title,
    message: 'Bieżący projekt ma niezapisane zmiany. Jeśli będziesz kontynuować, zostaną utracone.',
    confirmLabel: 'Kontynuuj bez zapisywania',
    danger: true,
    onConfirm: action,
  })
}

export function newProject() {
  guardUnsaved('Nowy projekt', () => {
    state().newProject()
    state().toast('Utworzono nowy projekt')
  })
}

export function loadExample() {
  guardUnsaved('Projekt przykładowy', () => {
    state().loadProject(createExampleProject())
    state().setStep('layers')
    state().toast('Wczytano projekt przykładowy', 'success')
  })
}

export function openProject() {
  guardUnsaved('Otwórz projekt', () => {
    void (async () => {
      try {
        const file = await openTextFile(PROJECT_TYPES)
        if (!file) return
        const project = parseProjectJson(file.text)
        state().loadProject(project, file.name, file.handle)
        logInfo(`Otwarto projekt ${file.name}`)
        state().toast(`Otwarto „${file.name}”`, 'success')
      } catch (error) {
        if (error instanceof ProjectFormatError) {
          state().toast(error.message, 'error')
        } else {
          logError(error, 'Otwieranie projektu')
        }
      }
    })()
  })
}

export async function saveProject(saveAs = false) {
  const s = state()
  try {
    const text = serializeProject(s.project)
    const name = s.fileName ?? suggestedFileName(s.project, 'json')
    const saved = await saveTextFile(text, name, PROJECT_TYPES, saveAs ? null : s.fileHandle)
    if (!saved) return
    state().markSaved(saved.name, saved.handle)
    logInfo(`Zapisano projekt ${saved.name}`)
    state().toast(saved.handle ? `Zapisano „${saved.name}”` : `Pobrano plik „${saved.name}”`, 'success')
  } catch (error) {
    logError(error, 'Zapis projektu')
  }
}

function currentCode(): string | null {
  try {
    return renderAs(state().project, { date: new Date() })
  } catch (error) {
    state().toast((error as Error).message.split('\n')[0], 'error')
    return null
  }
}

export async function copyAsCode() {
  const code = currentCode()
  if (code === null) return
  const ok = await copyText(code)
  state().toast(ok ? 'Skopiowano kod AS do schowka' : 'Nie udało się skopiować – zaznacz kod ręcznie', ok ? 'success' : 'error')
}

export async function saveAsCode() {
  const code = currentCode()
  if (code === null) return
  try {
    const name = suggestedFileName({ name: state().project.robot.programName || state().project.name }, 'as')
    const saved = await saveTextFile(code, name, AS_TYPES)
    if (saved) state().toast(saved.handle ? `Zapisano „${saved.name}”` : `Pobrano plik „${saved.name}”`, 'success')
  } catch (error) {
    logError(error, 'Zapis kodu AS')
  }
}
