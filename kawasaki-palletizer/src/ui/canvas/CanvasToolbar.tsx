import {
  Copy,
  Grid3x3,
  Layers2,
  ListOrdered,
  Magnet,
  MousePointer2,
  Plus,
  RotateCw,
  Ruler,
  RulerDimensionLine,
  Sparkles,
  SquarePlus,
  Trash2,
} from 'lucide-react'
import { isLayerEditable, useStore } from '../../state/store'
import { Button, cx, IconButton } from '../kit'

const GRID_STEPS = [10, 25, 50, 100]

function Divider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-line" />
}

export function CanvasToolbar() {
  const project = useStore((s) => s.project)
  const activeLayer = useStore((s) => s.activeLayer)
  const selection = useStore((s) => s.selection)
  const tool = useStore((s) => s.tool)
  const store = useStore.getState()

  const editable = isLayerEditable(project, activeLayer)
  const hasSelection = selection.length > 0 && editable
  const hasB = !!project.layers.B

  return (
    <div className="@container flex h-12 shrink-0 items-center gap-1 border-b border-line bg-panel px-3" data-testid="canvas-toolbar">
      {/* Warstwy */}
      <div className="mr-1 flex items-center gap-1" role="tablist" aria-label="Warstwy">
        {(['A', 'B'] as const).map((name) => {
          if (name === 'B' && !hasB) return null
          const active = activeLayer === name
          const count = (name === 'A' ? project.layers.A : project.layers.B!).items.length
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`layer-tab-${name}`}
              onClick={() => store.setActiveLayer(name)}
              className={cx(
                'flex h-8.5 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold whitespace-nowrap transition-colors',
                active ? 'bg-accent-soft text-accent-text' : 'text-muted hover:bg-hover hover:text-fg',
              )}
            >
              <span
                className="size-2.5 rounded-[3px]"
                style={{ background: name === 'A' ? 'var(--item-a-edge)' : 'var(--item-b-edge)' }}
              />
              <span>
                <span className="@max-[620px]:hidden">Warstwa </span>
                {name}
              </span>
              <span className={cx('rounded-md px-1.5 text-[11px] tabular-nums', active ? 'bg-panel/70' : 'bg-raised')}>{count}</span>
            </button>
          )
        })}
        {!hasB && (
          <button
            type="button"
            data-testid="add-layer-b"
            data-tip="Utwórz warstwę B jako obrót A o 180°"
            data-tip-align="start"
            onClick={() => store.createLayerB('rot180')}
            className="tip flex h-8.5 shrink-0 items-center gap-1.5 rounded-lg border border-dashed whitespace-nowrap border-line-strong px-2.5 text-[12.5px] font-medium text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-text"
          >
            <Plus size={14} />
            <span className="@max-[620px]:hidden">Warstwa</span> B
          </button>
        )}
      </div>

      <Divider />

      <IconButton label="Zaznaczanie" shortcut="V" active={tool === 'select'} onClick={() => store.setTool('select')}>
        <MousePointer2 size={16} />
      </IconButton>
      <IconButton label="Miarka" shortcut="M" active={tool === 'measure'} onClick={() => store.setTool(tool === 'measure' ? 'select' : 'measure')}>
        <Ruler size={16} />
      </IconButton>
      <IconButton
        label="Ustal kolejność klikaniem"
        shortcut="O"
        active={tool === 'order'}
        disabled={!editable || getCount(project, activeLayer) === 0}
        onClick={() => store.setTool(tool === 'order' ? 'select' : 'order')}
      >
        <ListOrdered size={16} />
      </IconButton>

      <Divider />

      <IconButton label="Dodaj produkt" shortcut="N" disabled={!editable} onClick={() => store.addItem()}>
        <SquarePlus size={16} />
      </IconButton>
      <IconButton label="Obróć o 90°" shortcut="R" disabled={!hasSelection} onClick={() => store.rotateSelected(90)}>
        <RotateCw size={16} />
      </IconButton>
      <IconButton label="Duplikuj" shortcut="Ctrl+D" disabled={!hasSelection} onClick={() => store.duplicateSelected()}>
        <Copy size={16} />
      </IconButton>
      <IconButton label="Usuń" shortcut="Delete" disabled={!hasSelection} onClick={() => store.deleteSelected()}>
        <Trash2 size={16} />
      </IconButton>

      <Divider />

      <Button size="sm" icon={<Sparkles size={14} />} onClick={() => store.openDialog('generator')} data-testid="open-generator">
        <span className="@max-[560px]:hidden">Generator</span>
      </Button>

    </div>
  )
}

/** Opcje wyświetlania edytora – pływający pasek w rogu obszaru roboczego. */
export function CanvasViewOptions() {
  const hasB = useStore((s) => !!s.project.layers.B)
  const grid = useStore((s) => s.grid)
  const gridStep = useStore((s) => s.gridStep)
  const snap = useStore((s) => s.snap)
  const showGhost = useStore((s) => s.showGhost)
  const showDimensions = useStore((s) => s.showDimensions)
  const store = useStore.getState()

  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-xl border border-line bg-panel/95 p-1 shadow-pop backdrop-blur" data-testid="view-options">
        <IconButton size="sm" tipSide="top" tipAlign="start" label="Siatka" shortcut="G" active={grid} onClick={() => store.setPrefs({ grid: !grid })}>
          <Grid3x3 size={15} />
        </IconButton>
        <select
          aria-label="Krok siatki"
          value={gridStep}
          disabled={!grid}
          onChange={(e) => store.setPrefs({ gridStep: Number(e.target.value) })}
          className="h-7 cursor-pointer rounded-md border border-transparent bg-transparent px-1 text-[12px] text-muted tabular-nums hover:border-line hover:text-fg disabled:opacity-40"
        >
          {GRID_STEPS.map((s) => (
            <option key={s} value={s}>
              {s} mm
            </option>
          ))}
        </select>
        <IconButton size="sm" tipSide="top" label="Przyciąganie do krawędzi" shortcut="S" active={snap} onClick={() => store.setPrefs({ snap: !snap })}>
          <Magnet size={15} />
        </IconButton>
        <IconButton size="sm" tipSide="top" label="Wymiary palety" active={showDimensions} onClick={() => store.setPrefs({ showDimensions: !showDimensions })}>
          <RulerDimensionLine size={15} />
        </IconButton>
        <IconButton
          label={hasB ? 'Pokaż drugą warstwę pod spodem' : 'Podgląd drugiej warstwy (wymaga warstwy B)'}
          active={showGhost && hasB}
          disabled={!hasB}
          size="sm"
          tipSide="top"
          onClick={() => store.setPrefs({ showGhost: !showGhost })}
        >
          <Layers2 size={15} />
        </IconButton>
    </div>
  )
}

function getCount(project: ReturnType<typeof useStore.getState>['project'], layer: 'A' | 'B') {
  return (layer === 'B' ? project.layers.B : project.layers.A)?.items.length ?? 0
}
