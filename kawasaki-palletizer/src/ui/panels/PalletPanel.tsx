import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Info, MoveDiagonal } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { PALLET_PRESETS } from '../../core/defaults'
import {
  axesValid,
  CORNER_LABELS,
  CORNERS,
  cornerPoint,
  DIRECTION_LABELS,
  perpendicularDirections,
  VECTORS,
  zAxisDirection,
} from '../../core/geometry'
import type { Corner, Direction, Pallet } from '../../core/types'
import { useStore } from '../../state/store'
import { cx } from '../cx'
import { Button, Callout, Field, NumberField, Section, Select } from '../kit'

const ARROWS: Record<Direction, ReactNode> = {
  prawo: <ArrowRight size={15} />,
  lewo: <ArrowLeft size={15} />,
  gora: <ArrowUp size={15} />,
  dol: <ArrowDown size={15} />,
}

/** Czy oś o danym kierunku wychodzi z narożnika BASE w stronę palety. */
function pointsInward(pallet: Pallet, direction: Direction): boolean {
  const o = cornerPoint(pallet, pallet.baseCorner)
  const v = VECTORS[direction]
  return (pallet.length / 2 - o.x) * v[0] + (pallet.width / 2 - o.y) * v[1] > 0
}

function inwardAxes(pallet: Pallet): { xDirection: Direction; yDirection: Direction } {
  const horizontal: Direction = pallet.baseCorner === 'A' || pallet.baseCorner === 'D' ? 'prawo' : 'lewo'
  const vertical: Direction = pallet.baseCorner === 'A' || pallet.baseCorner === 'B' ? 'dol' : 'gora'
  const xHorizontal = pallet.xDirection === 'prawo' || pallet.xDirection === 'lewo'
  return xHorizontal ? { xDirection: horizontal, yDirection: vertical } : { xDirection: vertical, yDirection: horizontal }
}

export function PalletPanel() {
  const pallet = useStore((s) => s.project.pallet)
  const setPallet = useStore((s) => s.setPallet)
  const lengthId = useId()
  const widthId = useId()

  const preset = PALLET_PRESETS.find((p) => p.length === pallet.length && p.width === pallet.width)?.id ?? 'custom'
  const valid = axesValid(pallet)
  const z = zAxisDirection(pallet)
  const xInward = pointsInward(pallet, pallet.xDirection)
  const yInward = pointsInward(pallet, pallet.yDirection)

  const setX = (xDirection: Direction) => {
    let yDirection = pallet.yDirection
    const options = perpendicularDirections(xDirection)
    if (!options.includes(yDirection)) {
      // Zachowujemy dotychczasowy zwrot osi Z, jeśli to możliwe.
      yDirection = options.find((y) => zAxisDirection({ ...pallet, xDirection, yDirection: y }) === z) ?? options[0]
    }
    setPallet({ xDirection, yDirection })
  }

  return (
    <>
      <Section title="Wymiary palety">
        <Field label="Typ palety">
          <Select
            ariaLabel="Typ palety"
            value={preset}
            onChange={(id) => {
              const p = PALLET_PRESETS.find((x) => x.id === id)
              if (p) setPallet({ length: p.length, width: p.width })
            }}
            options={[...PALLET_PRESETS.map((p) => ({ value: p.id, label: p.label })), { value: 'custom', label: 'Wymiar własny', disabled: preset !== 'custom' }]}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Długość" htmlFor={lengthId}>
            <NumberField id={lengthId} value={pallet.length} min={1} max={10000} step={10} unit="mm" onChange={(length) => setPallet({ length })} />
          </Field>
          <Field label="Szerokość" htmlFor={widthId}>
            <NumberField id={widthId} value={pallet.width} min={1} max={10000} step={10} unit="mm" onChange={(width) => setPallet({ width })} />
          </Field>
        </div>
        <p className="text-[11.5px] leading-snug text-subtle">Długość biegnie poziomo, a szerokość pionowo w widoku z góry.</p>
      </Section>

      <Section title="Układ BASE">
        <p className="-mt-1 text-[12.5px] leading-snug text-muted">
          Wskaż narożnik górnej powierzchni palety, w którym nauczono punkt BASE, oraz kierunki osi robota.
        </p>

        <BasePicker pallet={pallet} onCorner={(baseCorner) => setPallet({ baseCorner })} />

        <Field label={<AxisLabel color="var(--axis-x)">Kierunek osi +X</AxisLabel>}>
          <DirectionPicker axis="X" value={pallet.xDirection} onChange={setX} />
        </Field>
        <Field label={<AxisLabel color="var(--axis-y)">Kierunek osi +Y</AxisLabel>}>
          <DirectionPicker axis="Y" value={pallet.yDirection} allowed={perpendicularDirections(pallet.xDirection)} onChange={(yDirection) => setPallet({ yDirection })} />
        </Field>

        {!valid && (
          <Callout tone="danger" icon={<Info size={15} />}>
            Osie +X i +Y muszą być prostopadłe. Wybierz inny kierunek osi +Y.
          </Callout>
        )}

        {valid && (
          <div className="flex items-center justify-between rounded-lg bg-raised px-3 py-2 text-[12.5px]">
            <span className="text-muted">Oś +Z układu prawoskrętnego</span>
            <span className="font-semibold" style={{ color: 'var(--axis-z)' }} data-testid="z-direction">
              {z === 'up' ? 'w górę, od palety' : 'w dół, do palety'}
            </span>
          </div>
        )}

        {valid && (!xInward || !yInward) && (
          <Callout tone="info" icon={<Info size={15} />}>
            <p>
              {!xInward && !yInward ? 'Osie +X i +Y wskazują' : !xInward ? 'Oś +X wskazuje' : 'Oś +Y wskazuje'} poza paletę – współrzędne punktów
              będą ujemne.
            </p>
            <Button size="sm" className="mt-2" icon={<MoveDiagonal size={13} />} onClick={() => setPallet(inwardAxes(pallet))}>
              Skieruj osie na paletę
            </Button>
          </Callout>
        )}
      </Section>
    </>
  )
}

function AxisLabel({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-0.5 w-3.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  )
}

function DirectionPicker({
  axis,
  value,
  allowed,
  onChange,
}: {
  axis: 'X' | 'Y'
  value: Direction
  allowed?: Direction[]
  onChange: (direction: Direction) => void
}) {
  const order: Direction[] = ['lewo', 'gora', 'dol', 'prawo']
  return (
    <div role="radiogroup" aria-label={`Kierunek osi +${axis}`} className="grid grid-cols-4 gap-1.5">
      {order.map((d) => {
        const selected = d === value
        const disabled = allowed ? !allowed.includes(d) : false
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`+${axis} ${DIRECTION_LABELS[d]}`}
            data-testid={`axis-${axis.toLowerCase()}-${d}`}
            disabled={disabled}
            title={disabled ? 'Osie muszą być prostopadłe' : DIRECTION_LABELS[d]}
            onClick={() => onChange(d)}
            className={cx(
              'flex h-9 flex-col items-center justify-center rounded-lg border text-[10.5px] font-medium transition-colors',
              'disabled:opacity-30 disabled:pointer-events-none',
              selected
                ? 'border-accent bg-accent-soft text-accent-text'
                : 'border-line bg-inset text-muted hover:border-line-strong hover:text-fg',
            )}
          >
            {ARROWS[d]}
          </button>
        )
      })}
    </div>
  )
}

/** Miniatura palety z klikalnymi narożnikami A–D i podglądem osi. */
function BasePicker({ pallet, onCorner }: { pallet: Pallet; onCorner: (corner: Corner) => void }) {
  const W = 284
  const ratio = Math.min(1.9, Math.max(0.55, pallet.length / pallet.width))
  const boxW = ratio >= 1 ? 168 : 168 * ratio
  const boxH = ratio >= 1 ? 168 / ratio : 168
  const H = boxH + 76
  const x0 = (W - boxW) / 2
  const y0 = (H - boxH) / 2
  const pos: Record<Corner, [number, number]> = {
    A: [x0, y0],
    B: [x0 + boxW, y0],
    C: [x0 + boxW, y0 + boxH],
    D: [x0, y0 + boxH],
  }
  const [bx, by] = pos[pallet.baseCorner]
  const arrow = (dir: Direction, color: string, label: string) => {
    const v = VECTORS[dir]
    const len = Math.min(46, (Math.abs(v[0]) ? boxW : boxH) * 0.42)
    const ex = bx + v[0] * len
    const ey = by + v[1] * len
    return (
      <g>
        <line x1={bx} y1={by} x2={ex} y2={ey} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <path
          d={`M ${ex + v[0] * 7} ${ey + v[1] * 7} L ${ex - v[1] * 4.5} ${ey + v[0] * 4.5} L ${ex + v[1] * 4.5} ${ey - v[0] * 4.5} Z`}
          fill={color}
        />
        <text x={ex + v[0] * 17} y={ey + v[1] * 17} textAnchor="middle" dominantBaseline="central" fontSize={10.5} fontWeight={700} fill={color}>
          {label}
        </text>
      </g>
    )
  }

  return (
    <div className="relative mx-auto" style={{ width: W, height: H }} data-testid="base-picker">
      <svg width={W} height={H} className="absolute inset-0">
        <rect x={x0} y={y0} width={boxW} height={boxH} rx={5} fill="var(--pallet)" stroke="var(--pallet-edge)" strokeWidth={1.25} />
        {[1, 2, 3].map((i) => (
          <line key={i} x1={x0} x2={x0 + boxW} y1={y0 + (boxH * i) / 4} y2={y0 + (boxH * i) / 4} stroke="var(--pallet-plank)" strokeWidth={1.5} />
        ))}
        {axesValid(pallet) && (
          <>
            {arrow(pallet.xDirection, 'var(--axis-x)', '+X')}
            {arrow(pallet.yDirection, 'var(--axis-y)', '+Y')}
          </>
        )}
      </svg>
      {CORNERS.map((corner) => {
        const [cxp, cyp] = pos[corner]
        const selected = corner === pallet.baseCorner
        return (
          <button
            key={corner}
            type="button"
            aria-label={`BASE w narożniku ${corner} (${CORNER_LABELS[corner]})`}
            aria-pressed={selected}
            data-testid={`corner-${corner}`}
            title={`Narożnik ${corner} – ${CORNER_LABELS[corner]}`}
            onClick={() => onCorner(corner)}
            style={{ left: cxp - 14, top: cyp - 14 }}
            className={cx(
              'absolute flex size-7 items-center justify-center rounded-full border text-[12px] font-bold transition-all',
              selected
                ? 'scale-110 border-fg bg-fg text-panel shadow-pop'
                : 'border-line-strong bg-panel text-muted hover:border-accent hover:text-accent-text',
            )}
          >
            {corner}
          </button>
        )
      })}
      <span
        className="absolute text-[10px] font-bold tracking-[0.08em] text-fg"
        style={{
          left: pallet.baseCorner === 'A' || pallet.baseCorner === 'D' ? bx - 14 : undefined,
          right: pallet.baseCorner === 'B' || pallet.baseCorner === 'C' ? W - bx - 14 : undefined,
          top: pallet.baseCorner === 'A' || pallet.baseCorner === 'B' ? by - 32 : by + 19,
        }}
      >
        BASE
      </span>
    </div>
  )
}
