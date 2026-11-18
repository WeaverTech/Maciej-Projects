import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from 'react'
import { logError } from './state/diagnostics'
import { saveAutosave, savePrefs } from './state/persistence'
import { isDirty, useStore } from './state/store'
import { CanvasToolbar } from './ui/canvas/CanvasToolbar'
import { PalletCanvas } from './ui/canvas/PalletCanvas'
import { CyclesDialog } from './ui/dialogs/CyclesDialog'
import { DiagnosticsDialog } from './ui/dialogs/DiagnosticsDialog'
import { GeneratorDialog } from './ui/dialogs/GeneratorDialog'
import { ConfirmDialog, Toasts } from './ui/dialogs/Overlays'
import { ShortcutsDialog } from './ui/dialogs/ShortcutsDialog'
import { useApplyTheme } from './ui/hooks'
import { Button } from './ui/kit'
import { RightPanel } from './ui/layout/RightPanel'
import { StatusBar } from './ui/layout/StatusBar'
import { StepRail } from './ui/layout/StepRail'
import { TopBar } from './ui/layout/TopBar'
import { PrintReport } from './ui/PrintReport'
import { useShortcuts } from './ui/useShortcuts'
import { AsCodeView } from './ui/views/AsCodeView'

const StackView3D = lazy(() => import('./ui/views/StackView3D').then((m) => ({ default: m.StackView3D })))

/** Błąd w jednym widoku nie może zabrać użytkownikowi projektu – trafia do logu, a widok można odtworzyć. */
class ErrorBoundary extends Component<{ children: ReactNode; name: string }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, `Błąd widoku „${this.props.name}”`)
    if (info.componentStack) console.error(info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-canvas p-8" role="alert">
        <div className="max-w-md rounded-2xl border border-line bg-panel p-6 shadow-pop">
          <h2 className="text-[15px] font-semibold">Ten widok napotkał błąd</h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Projekt jest bezpieczny (autozapis działa). Szczegóły zapisano w logu diagnostycznym – możesz spróbować ponownie.
          </p>
          <pre className="mt-3 max-h-24 overflow-auto rounded-lg bg-inset p-2 font-mono text-[11px] text-danger">{this.state.error.message}</pre>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" onClick={() => this.setState({ error: null })}>
              Spróbuj ponownie
            </Button>
            <Button onClick={() => useStore.getState().openDialog('diagnostics')}>Otwórz diagnostykę</Button>
          </div>
        </div>
      </div>
    )
  }
}

function usePersistence() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const flush = () => {
      const s = useStore.getState()
      saveAutosave(s.project, s.fileName, isDirty(s))
    }
    const unsubscribe = useStore.subscribe((state, previous) => {
      if (state.project !== previous.project || state.savedProject !== previous.savedProject || state.fileName !== previous.fileName) {
        clearTimeout(timer)
        timer = setTimeout(flush, 400)
      }
      if (
        state.theme !== previous.theme ||
        state.grid !== previous.grid ||
        state.gridStep !== previous.gridStep ||
        state.snap !== previous.snap ||
        state.showGhost !== previous.showGhost ||
        state.coordMode !== previous.coordMode ||
        state.showDimensions !== previous.showDimensions
      ) {
        const { theme, grid, gridStep, snap, showGhost, coordMode, showDimensions } = state
        savePrefs({ theme, grid, gridStep, snap, showGhost, coordMode, showDimensions })
      }
    })
    const onHide = () => {
      clearTimeout(timer)
      flush()
    }
    window.addEventListener('pagehide', onHide)
    return () => {
      unsubscribe()
      clearTimeout(timer)
      window.removeEventListener('pagehide', onHide)
    }
  }, [])
}

function useDocumentTitle() {
  const name = useStore((s) => s.project.name)
  const dirty = useStore((s) => isDirty(s))
  useEffect(() => {
    document.title = `${dirty ? '• ' : ''}${name || 'Projekt bez nazwy'} – Kawasaki Palletizer`
  }, [name, dirty])
}

export function App() {
  const view = useStore((s) => s.view)
  const dialog = useStore((s) => s.dialog)
  useApplyTheme()
  useShortcuts()
  usePersistence()
  useDocumentTitle()

  return (
    <>
      <div className="flex h-full min-w-[1240px] flex-col print:hidden" data-testid="app">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <StepRail />
          <main className="flex min-w-0 flex-1 flex-col">
            {view === 'layout' && (
              <ErrorBoundary name="Układ 2D">
                <CanvasToolbar />
                <PalletCanvas />
              </ErrorBoundary>
            )}
            {view === 'stack' && (
              <ErrorBoundary name="Stos 3D">
                <Suspense fallback={<div className="flex flex-1 items-center justify-center bg-canvas text-[13px] text-muted">Wczytywanie podglądu 3D…</div>}>
                  <StackView3D />
                </Suspense>
              </ErrorBoundary>
            )}
            {view === 'code' && (
              <ErrorBoundary name="Kod AS">
                <AsCodeView />
              </ErrorBoundary>
            )}
          </main>
          {view === 'layout' && <RightPanel />}
        </div>
        <StatusBar />
      </div>

      {dialog === 'generator' && <GeneratorDialog />}
      {dialog === 'cycles' && <CyclesDialog />}
      {dialog === 'shortcuts' && <ShortcutsDialog />}
      {dialog === 'diagnostics' && <DiagnosticsDialog />}
      <ConfirmDialog />
      <Toasts />
      <PrintReport />
    </>
  )
}
