import {
  Box,
  Bug,
  ChevronDown,
  ClipboardCopy,
  Code2,
  FileDown,
  FilePlus2,
  FolderOpen,
  Keyboard,
  LayoutGrid,
  LifeBuoy,
  Monitor,
  Moon,
  Printer,
  Redo2,
  Save,
  SaveAll,
  Sparkles,
  Sun,
  Undo2,
} from 'lucide-react'
import { copyAsCode, loadExample, newProject, openProject, saveAsCode, saveProject } from '../../state/actions'
import { isDirty, useStore, type ViewMode } from '../../state/store'
import { cx } from '../cx'
import { Button, IconButton, Menu, Segmented } from '../kit'

function Logo() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-br from-[#4f6bff] to-[#2a3fd0] shadow-soft" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2.5" width="6.2" height="4" rx="1" fill="#fff" />
        <rect x="9.8" y="2.5" width="6.2" height="4" rx="1" fill="#fff" fillOpacity="0.72" />
        <rect x="2" y="8" width="4" height="4" rx="1" fill="#fff" fillOpacity="0.72" />
        <rect x="7.4" y="8" width="8.6" height="4" rx="1" fill="#fff" />
        <rect x="1.5" y="13.6" width="15" height="2.2" rx="0.8" fill="#ffd591" />
      </svg>
    </div>
  )
}

const THEME_NEXT = { light: 'dark', dark: 'system', system: 'light' } as const
const THEME_LABEL = { light: 'Motyw jasny', dark: 'Motyw ciemny', system: 'Motyw systemowy' } as const

export function TopBar() {
  const name = useStore((s) => s.project.name)
  const fileName = useStore((s) => s.fileName)
  const dirty = useStore((s) => isDirty(s))
  const canUndo = useStore((s) => s.past.length > 0)
  const canRedo = useStore((s) => s.future.length > 0)
  const view = useStore((s) => s.view)
  const theme = useStore((s) => s.theme)
  const store = useStore.getState()

  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-3.5" data-testid="top-bar">
      <div className="flex items-center gap-2.5">
        <Logo />
        <div className="hidden leading-tight xl:block">
          <p className="text-[13px] font-semibold tracking-tight">Kawasaki Palletizer</p>
          <p className="text-[10.5px] font-medium text-subtle">Projektowanie paletyzacji · kod AS</p>
        </div>
      </div>

      <div className="mx-1 h-6 w-px bg-line" />

      <Menu
        label="Menu Plik"
        trigger={
          <>
            Plik <ChevronDown size={14} />
          </>
        }
        items={[
          { label: 'Nowy projekt', icon: <FilePlus2 size={15} />, onSelect: newProject },
          { label: 'Otwórz…', icon: <FolderOpen size={15} />, shortcut: 'Ctrl+O', onSelect: openProject },
          { label: 'Projekt przykładowy', icon: <Sparkles size={15} />, onSelect: loadExample },
          { label: 'Zapisz', icon: <Save size={15} />, shortcut: 'Ctrl+S', onSelect: () => void saveProject(), separatorBefore: true },
          { label: 'Zapisz jako…', icon: <SaveAll size={15} />, shortcut: 'Ctrl+Shift+S', onSelect: () => void saveProject(true) },
          { label: 'Eksportuj kod AS…', icon: <FileDown size={15} />, shortcut: 'Ctrl+E', onSelect: () => void saveAsCode(), separatorBefore: true },
          { label: 'Kopiuj kod AS', icon: <ClipboardCopy size={15} />, onSelect: () => void copyAsCode() },
          { label: 'Drukuj kartę paletyzacji', icon: <Printer size={15} />, shortcut: 'Ctrl+P', onSelect: () => window.print() },
        ]}
      />

      <div className="flex min-w-0 items-center gap-2">
        <input
          aria-label="Nazwa projektu"
          data-testid="project-name"
          value={name}
          spellCheck={false}
          onChange={(e) => store.setName(e.target.value)}
          placeholder="Nazwa projektu"
          style={{ width: `${Math.min(46, Math.max(12, name.length + 2))}ch` }}
          className="h-8 min-w-0 rounded-lg border border-transparent bg-transparent px-2 text-[13.5px] font-semibold text-fg transition-colors hover:border-line focus:border-accent focus:bg-inset focus:outline-none"
        />
        <span
          className={cx('tip flex shrink-0 items-center gap-1.5 text-[11.5px]', dirty ? 'text-warning' : 'text-subtle')}
          data-tip={dirty ? 'Zmiany nie są zapisane w pliku (autozapis w przeglądarce działa)' : 'Wszystkie zmiany zapisane'}
          data-testid="save-state"
        >
          <span className={cx('size-1.5 rounded-full', dirty ? 'bg-warning' : 'bg-success')} />
          <span className="hidden max-w-40 truncate lg:inline">{fileName ?? (dirty ? 'Niezapisany' : 'Nowy projekt')}</span>
        </span>
      </div>

      <div className="flex-1" />

      <Segmented<ViewMode>
        ariaLabel="Widok"
        value={view}
        onChange={store.setView}
        options={[
          { value: 'layout', testId: 'view-layout', label: (<><LayoutGrid size={14} /> Układ 2D</>) },
          { value: 'stack', testId: 'view-stack', label: (<><Box size={14} /> Stos 3D</>) },
          { value: 'code', testId: 'view-code', label: (<><Code2 size={14} /> Kod AS</>) },
        ]}
      />

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        <IconButton label="Cofnij" shortcut="Ctrl+Z" disabled={!canUndo} onClick={store.undo} data-testid="undo">
          <Undo2 size={16} />
        </IconButton>
        <IconButton label="Ponów" shortcut="Ctrl+Y" disabled={!canRedo} onClick={store.redo} data-testid="redo">
          <Redo2 size={16} />
        </IconButton>
      </div>

      <Button variant="primary" icon={<Save size={15} />} onClick={() => void saveProject()} data-testid="save-project">
        Zapisz
      </Button>

      <div className="flex items-center gap-0.5">
        <IconButton label={`${THEME_LABEL[theme]} – kliknij, aby zmienić`} tipAlign="end" onClick={() => store.setPrefs({ theme: THEME_NEXT[theme] })} data-testid="theme-toggle">
          {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
        </IconButton>
        <Menu
          label="Pomoc"
          align="end"
          trigger={<LifeBuoy size={16} />}
          items={[
            { label: 'Skróty klawiszowe', icon: <Keyboard size={15} />, shortcut: '?', onSelect: () => store.openDialog('shortcuts') },
            { label: 'Diagnostyka i log błędów', icon: <Bug size={15} />, onSelect: () => store.openDialog('diagnostics') },
          ]}
        />
      </div>
    </header>
  )
}
