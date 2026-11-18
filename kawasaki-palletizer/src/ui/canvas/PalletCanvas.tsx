import { Link2Off, Maximize, Minus, Plus, Sparkles, SquarePlus } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { formatMm } from '../../core/format'
import { cornerPoint, CORNERS, origin, placementRect, rectsBounds, rectsIntersect, VECTORS, axesValid } from '../../core/geometry'
import { sectionByProduct } from '../../core/gripper'
import { getLayer } from '../../core/layers'
import { snapMeasurePoint, snapMove, type Guide } from '../../core/snapping'
import type { Corner, Pallet, Placement, Point, Rect } from '../../core/types'
import { loadExample } from '../../state/actions'
import { useCursor } from '../../state/cursor'
import { isLayerEditable, useStore } from '../../state/store'
import { useIssueSets } from '../hooks'
import { cx } from '../cx'
import { Button, IconButton } from '../kit'
import { CanvasViewOptions } from './CanvasToolbar'

const MIN_ZOOM = 0.04
const MAX_ZOOM = 6
const DRAG_THRESHOLD = 4

interface ViewT {
  zoom: number
  panX: number
  panY: number
}

type Drag =
  | {
      kind: 'move'
      startX: number
      startY: number
      origin: Map<number, Point>
      bounds: Rect
      others: Rect[]
      started: boolean
      clickedId: number
      collapseOnClick: boolean
    }
  | { kind: 'marquee'; x0: number; y0: number; base: number[]; moved: boolean }
  | { kind: 'pan'; startX: number; startY: number; panX: number; panY: number }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function fitView(width: number, height: number, pallet: Pallet): ViewT {
  const margin = 86
  const zoom = clamp(
    Math.min((width - 2 * margin) / pallet.length, (height - 2 * margin) / pallet.width),
    MIN_ZOOM,
    MAX_ZOOM,
  )
  return { zoom, panX: (width - pallet.length * zoom) / 2, panY: (height - pallet.width * zoom) / 2 }
}

export function PalletCanvas() {
  const project = useStore((s) => s.project)
  const activeLayer = useStore((s) => s.activeLayer)
  const selection = useStore((s) => s.selection)
  const tool = useStore((s) => s.tool)
  const grid = useStore((s) => s.grid)
  const gridStep = useStore((s) => s.gridStep)
  const snap = useStore((s) => s.snap)
  const showGhost = useStore((s) => s.showGhost)
  const showDimensions = useStore((s) => s.showDimensions)
  const fitRequest = useStore((s) => s.fitRequest)
  const orderCursor = useStore((s) => s.orderCursor)
  const issueSets = useIssueSets()

  const { pallet, product } = project
  const layer = getLayer(project, activeLayer)
  const editable = isLayerEditable(project, activeLayer)
  const otherLayer = activeLayer === 'A' ? project.layers.B : project.layers.A
  const sections = useMemo(
    () => (project.robot.pickMode === 'podwojny' ? sectionByProduct(project) : null),
    [project],
  )

  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [view, setView] = useState<ViewT>({ zoom: 0.5, panX: 0, panY: 0 })
  const viewRef = useRef(view)
  viewRef.current = view
  const autoFit = useRef(true)
  const drag = useRef<Drag | null>(null)
  const spaceDown = useRef(false)
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [panning, setPanning] = useState(false)
  const [measure, setMeasure] = useState<Point[]>([])
  const [measureHover, setMeasureHover] = useState<{ point: Point; snapped: boolean } | null>(null)

  const setCursor = useCursor((s) => s.setCursor)
  const setZoomInfo = useCursor((s) => s.setZoom)
  const setMeasureInfo = useCursor((s) => s.setMeasure)

  /* ---------------------------------------------------------------- rozmiar i dopasowanie */

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const apply = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    apply()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const fit = useCallback(() => {
    if (size.w < 10 || size.h < 10) return
    autoFit.current = true
    setView(fitView(size.w, size.h, pallet))
  }, [size.w, size.h, pallet])

  useLayoutEffect(() => {
    if (autoFit.current) fit()
  }, [fit])

  useLayoutEffect(() => {
    if (fitRequest > 0) fit()
    // Dopasowanie tylko na wyraźne żądanie (nowy projekt, zmiana wymiarów palety, przycisk).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitRequest])

  useEffect(() => setZoomInfo(view.zoom), [view.zoom, setZoomInfo])

  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    autoFit.current = false
    setView((v) => {
      const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM)
      const px = cx ?? (wrapRef.current?.clientWidth ?? 0) / 2
      const py = cy ?? (wrapRef.current?.clientHeight ?? 0) / 2
      const k = zoom / v.zoom
      return { zoom, panX: px - (px - v.panX) * k, panY: py - (py - v.panY) * k }
    })
  }, [])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))
      zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        spaceDown.current = true
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  /* ---------------------------------------------------------------- miarka */

  useEffect(() => {
    if (tool !== 'measure') {
      setMeasure([])
      setMeasureHover(null)
    }
  }, [tool, activeLayer])

  useEffect(() => {
    if (measure.length === 2) {
      const dx = measure[1].x - measure[0].x
      const dy = measure[1].y - measure[0].y
      setMeasureInfo({ dx, dy, length: Math.hypot(dx, dy) })
    } else {
      setMeasureInfo(null)
    }
  }, [measure, setMeasureInfo])

  useEffect(() => () => setMeasureInfo(null), [setMeasureInfo])

  /* ---------------------------------------------------------------- wskaźnik */

  const toMm = (clientX: number, clientY: number): Point => {
    const rect = svgRef.current!.getBoundingClientRect()
    const v = viewRef.current
    return { x: (clientX - rect.left - v.panX) / v.zoom, y: (clientY - rect.top - v.panY) / v.zoom }
  }

  const toLocal = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const itemRects = useMemo(() => layer.items.map((i) => ({ item: i, rect: placementRect(i, product) })), [layer.items, product])

  const measurePoint = (clientX: number, clientY: number) =>
    snapMeasurePoint(
      toMm(clientX, clientY),
      itemRects.map((r) => r.rect),
      pallet,
      12 / viewRef.current.zoom,
    )

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    const store = useStore.getState()
    const svg = svgRef.current!
    ;(document.activeElement as HTMLElement | null)?.blur?.()

    if (e.button === 1 || (e.button === 0 && spaceDown.current)) {
      e.preventDefault()
      svg.setPointerCapture(e.pointerId)
      drag.current = { kind: 'pan', startX: e.clientX, startY: e.clientY, panX: view.panX, panY: view.panY }
      setPanning(true)
      return
    }

    if (tool === 'measure') {
      if (e.button === 2) {
        setMeasure([])
        return
      }
      if (e.button !== 0) return
      const { point } = measurePoint(e.clientX, e.clientY)
      setMeasure((m) => (m.length >= 2 ? [point] : [...m, point]))
      return
    }

    if (e.button !== 0) return
    const target = (e.target as Element).closest('[data-item-id]')
    const id = target ? Number(target.getAttribute('data-item-id')) : null

    if (tool === 'order') {
      if (id !== null && editable) store.clickOrder(id)
      return
    }

    const additive = e.shiftKey || e.ctrlKey || e.metaKey
    if (id !== null) {
      const wasSelected = selection.includes(id)
      let current = selection
      if (additive) {
        store.toggleSelect(id)
        return
      }
      if (!wasSelected) {
        current = [id]
        store.select(current)
      }
      if (!editable) return
      const moving = layer.items.filter((i) => current.includes(i.id))
      const bounds = rectsBounds(moving.map((i) => placementRect(i, product)))
      if (!bounds) return
      svg.setPointerCapture(e.pointerId)
      drag.current = {
        kind: 'move',
        startX: e.clientX,
        startY: e.clientY,
        origin: new Map(moving.map((i) => [i.id, { x: i.x, y: i.y }])),
        bounds,
        others: layer.items.filter((i) => !current.includes(i.id)).map((i) => placementRect(i, product)),
        started: false,
        clickedId: id,
        collapseOnClick: wasSelected && current.length > 1,
      }
      return
    }

    const local = toLocal(e.clientX, e.clientY)
    svg.setPointerCapture(e.pointerId)
    drag.current = { kind: 'marquee', x0: local.x, y0: local.y, base: additive ? selection : [], moved: false }
  }

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const mm = toMm(e.clientX, e.clientY)
    setCursor(mm.x, mm.y)
    const d = drag.current

    if (tool === 'measure' && !d) {
      setMeasureHover(measurePoint(e.clientX, e.clientY))
      return
    }
    if (!d) return

    if (d.kind === 'pan') {
      autoFit.current = false
      setView((v) => ({ ...v, panX: d.panX + (e.clientX - d.startX), panY: d.panY + (e.clientY - d.startY) }))
      return
    }

    if (d.kind === 'marquee') {
      const local = toLocal(e.clientX, e.clientY)
      const x = Math.min(d.x0, local.x)
      const y = Math.min(d.y0, local.y)
      const w = Math.abs(local.x - d.x0)
      const h = Math.abs(local.y - d.y0)
      if (!d.moved && w < DRAG_THRESHOLD && h < DRAG_THRESHOLD) return
      d.moved = true
      setMarquee({ x, y, w, h })
      const v = viewRef.current
      const area: Rect = { x1: (x - v.panX) / v.zoom, y1: (y - v.panY) / v.zoom, x2: (x + w - v.panX) / v.zoom, y2: (y + h - v.panY) / v.zoom }
      const hit = itemRects.filter((r) => rectsIntersect(r.rect, area)).map((r) => r.item.id)
      useStore.getState().select([...new Set([...d.base, ...hit])])
      return
    }

    // Przesuwanie zaznaczonych produktów.
    const pxX = e.clientX - d.startX
    const pxY = e.clientY - d.startY
    if (!d.started) {
      if (Math.hypot(pxX, pxY) < DRAG_THRESHOLD) return
      d.started = true
      useStore.getState().beginGesture()
    }
    const zoom = viewRef.current.zoom
    let dx = pxX / zoom
    let dy = pxY / zoom
    if (e.shiftKey) {
      if (Math.abs(dx) > Math.abs(dy)) dy = 0
      else dx = 0
    }
    const proposed: Rect = { x1: d.bounds.x1 + dx, y1: d.bounds.y1 + dy, x2: d.bounds.x2 + dx, y2: d.bounds.y2 + dy }
    const result = snapMove(proposed, d.others, pallet, {
      enabled: snap && !e.altKey,
      tolerance: 9 / zoom,
      grid,
      gridStep,
    })
    dx += result.dx
    dy += result.dy
    setGuides(result.guides)
    const positions = new Map<number, Point>()
    d.origin.forEach((p, id) => positions.set(id, { x: p.x + dx, y: p.y + dy }))
    useStore.getState().moveItems(positions, true)
  }

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current
    drag.current = null
    if (svgRef.current?.hasPointerCapture(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId)
    if (!d) return
    const store = useStore.getState()
    if (d.kind === 'pan') {
      setPanning(false)
    } else if (d.kind === 'marquee') {
      setMarquee(null)
      if (!d.moved) store.select(d.base)
    } else {
      setGuides([])
      if (d.started) store.endGesture()
      else if (d.collapseOnClick) store.select([d.clickedId])
    }
  }

  const onDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tool !== 'select' || !editable) return
    const target = (e.target as Element).closest('[data-item-id]')
    const store = useStore.getState()
    if (target) {
      store.select([Number(target.getAttribute('data-item-id'))])
      store.rotateSelected(90)
    } else {
      const mm = toMm(e.clientX, e.clientY)
      const step = grid ? gridStep : 1
      store.addItem({ x: Math.round(mm.x / step) * step, y: Math.round(mm.y / step) * step })
    }
  }

  /* ---------------------------------------------------------------- rysowanie */

  const { zoom, panX, panY } = view
  const sx = (x: number) => panX + x * zoom
  const sy = (y: number) => panY + y * zoom
  const palletW = pallet.length * zoom
  const palletH = pallet.width * zoom

  const gridLines = useMemo(() => {
    if (!grid || gridStep <= 0) return { xs: [] as number[], ys: [] as number[] }
    let step = gridStep
    for (const m of [2, 5, 10, 20, 50, 100]) {
      if (step * zoom >= 9) break
      step = gridStep * m
    }
    const xs: number[] = []
    const ys: number[] = []
    for (let x = step; x < pallet.length - 1e-6; x += step) xs.push(x)
    for (let y = step; y < pallet.width - 1e-6; y += step) ys.push(y)
    return { xs, ys }
  }, [grid, gridStep, zoom, pallet.length, pallet.width])

  const planks = useMemo(() => {
    const count = Math.max(2, Math.round(pallet.width / 150))
    return Array.from({ length: count - 1 }, (_, i) => ((i + 1) * pallet.width) / count)
  }, [pallet.width])

  const base = origin(pallet)
  const validAxes = axesValid(pallet)
  // Zaznaczone produkty są rysowane na wierzchu, żeby sąsiedzi nie zasłaniali ich obrysu.
  const drawOrder = selection.length
    ? [...layer.items].sort((a, b) => Number(selection.includes(a.id)) - Number(selection.includes(b.id)))
    : layer.items
  const cursorClass =
    panning ? 'cursor-grabbing' : tool === 'measure' ? 'cursor-crosshair' : tool === 'order' ? 'cursor-pointer' : 'cursor-default'

  const measureLine = measure.length === 2 ? measure : measure.length === 1 && measureHover ? [measure[0], measureHover.point] : null

  return (
    <div ref={wrapRef} className="canvas-dots relative min-h-0 w-full flex-1 overflow-hidden" data-testid="pallet-canvas">
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        className={cx('absolute inset-0 touch-none select-none', cursorClass)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          setCursor(null, null)
          setMeasureHover(null)
        }}
        onDoubleClick={onDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        role="img"
        aria-label={`Edytor warstwy ${activeLayer}`}
      >
        <defs>
          <filter id="pallet-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#000" floodOpacity="0.16" />
          </filter>
          <clipPath id="pallet-clip">
            <rect x={sx(0)} y={sy(0)} width={palletW} height={palletH} rx={5} />
          </clipPath>
        </defs>

        {/* Paleta */}
        <rect x={sx(0)} y={sy(0)} width={palletW} height={palletH} rx={5} fill="var(--pallet)" filter="url(#pallet-shadow)" />
        <g clipPath="url(#pallet-clip)" pointerEvents="none">
          {planks.map((y) => (
            <line key={y} x1={sx(0)} x2={sx(pallet.length)} y1={sy(y)} y2={sy(y)} stroke="var(--pallet-plank)" strokeWidth={2} />
          ))}
          {gridLines.xs.map((x) => (
            <line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(pallet.width)} stroke="var(--grid-line)" strokeWidth={1} />
          ))}
          {gridLines.ys.map((y) => (
            <line key={`gy${y}`} x1={sx(0)} x2={sx(pallet.length)} y1={sy(y)} y2={sy(y)} stroke="var(--grid-line)" strokeWidth={1} />
          ))}
        </g>
        <rect x={sx(0)} y={sy(0)} width={palletW} height={palletH} rx={5} fill="none" stroke="var(--pallet-edge)" strokeWidth={1.5} pointerEvents="none" />

        {showDimensions && <Dimensions pallet={pallet} sx={sx} sy={sy} />}
        <CornerLabels pallet={pallet} sx={sx} sy={sy} />

        {/* Druga warstwa jako podkład */}
        {showGhost &&
          otherLayer?.items.map((item) => {
            const r = placementRect(item, product)
            return (
              <g key={`ghost-${item.id}`} pointerEvents="none">
                <rect
                  x={sx(r.x1)}
                  y={sy(r.y1)}
                  width={(r.x2 - r.x1) * zoom}
                  height={(r.y2 - r.y1) * zoom}
                  rx={4}
                  fill="none"
                  stroke="var(--ghost)"
                  strokeWidth={1.25}
                  strokeDasharray="5 4"
                />
                <text x={sx(r.x1) + 6} y={sy(r.y1) + 14} fontSize={10.5} fontWeight={600} fill="var(--ghost)">
                  {otherLayer.name}
                  {item.order}
                </text>
              </g>
            )
          })}

        {/* Produkty */}
        {drawOrder.map((item) => (
          <ItemShape
            key={item.id}
            item={item}
            layer={activeLayer}
            kind={product.kind}
            length={product.length * zoom}
            width={product.width * zoom}
            cx={sx(item.x)}
            cy={sy(item.y)}
            selected={selection.includes(item.id)}
            state={issueSets.errors.has(item.id) ? 'error' : issueSets.warnings.has(item.id) ? 'warning' : 'ok'}
            section={sections?.get(item.order)?.section}
            interactive={tool !== 'measure'}
            dimmed={tool === 'order' && item.order >= orderCursor}
          />
        ))}

        {/* Osie BASE */}
        {validAxes && (
          <g pointerEvents="none">
            <AxisArrow x={sx(base.x)} y={sy(base.y)} dir={VECTORS[pallet.xDirection]} color="var(--axis-x)" label="+X" />
            <AxisArrow x={sx(base.x)} y={sy(base.y)} dir={VECTORS[pallet.yDirection]} color="var(--axis-y)" label="+Y" />
            <circle cx={sx(base.x)} cy={sy(base.y)} r={5} fill="var(--panel)" stroke="var(--fg)" strokeWidth={2} />
          </g>
        )}

        {/* Linie przyciągania */}
        {guides.map((g, idx) =>
          g.axis === 'x' ? (
            <line key={idx} x1={sx(g.pos)} x2={sx(g.pos)} y1={sy(g.from) - 14} y2={sy(g.to) + 14} stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 3" pointerEvents="none" />
          ) : (
            <line key={idx} x1={sx(g.from) - 14} x2={sx(g.to) + 14} y1={sy(g.pos)} y2={sy(g.pos)} stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 3" pointerEvents="none" />
          ),
        )}

        {marquee && (
          <rect
            x={marquee.x}
            y={marquee.y}
            width={marquee.w}
            height={marquee.h}
            fill="color-mix(in srgb, var(--accent) 12%, transparent)"
            stroke="var(--accent)"
            strokeWidth={1}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
        )}

        {/* Miarka */}
        {tool === 'measure' && (
          <g pointerEvents="none">
            {measureLine && (
              <MeasureLine a={measureLine[0]} b={measureLine[1]} sx={sx} sy={sy} final={measure.length === 2} />
            )}
            {measure.map((p, idx) => (
              <MeasureDot key={idx} x={sx(p.x)} y={sy(p.y)} label={`P${idx + 1}`} />
            ))}
            {measureHover && measure.length < 2 && (
              <circle
                cx={sx(measureHover.point.x)}
                cy={sy(measureHover.point.y)}
                r={measureHover.snapped ? 7 : 4}
                fill={measureHover.snapped ? 'color-mix(in srgb, var(--accent) 25%, transparent)' : 'none'}
                stroke="var(--accent)"
                strokeWidth={1.5}
              />
            )}
          </g>
        )}
      </svg>

      {/* Nakładki HTML */}
      {activeLayer === 'B' && project.layers.B?.link === 'rot180' && (
        <div className="absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-panel/95 py-1.5 pr-1.5 pl-4 text-[12.5px] shadow-pop backdrop-blur">
          <span className="text-muted">
            Warstwa B to <strong className="font-semibold text-fg">obrót A o 180°</strong> – aktualizuje się sama
          </span>
          <Button size="sm" icon={<Link2Off size={13} />} onClick={() => useStore.getState().setLayerBLink(false)}>
            Edytuj niezależnie
          </Button>
        </div>
      )}

      {tool === 'order' && (
        <div className="absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-accent/30 bg-panel/95 py-1.5 pr-1.5 pl-4 text-[12.5px] shadow-pop backdrop-blur">
          <span className="text-muted">
            Klikaj produkty w kolejności układania · następny numer{' '}
            <strong className="font-semibold text-accent-text">{Math.min(orderCursor, layer.items.length)}</strong>
          </span>
          <Button size="sm" onClick={() => useStore.getState().setTool('select')}>
            Zakończ
          </Button>
        </div>
      )}

      {tool === 'measure' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full border border-accent/30 bg-panel/95 px-4 py-2 text-[12.5px] text-muted shadow-pop backdrop-blur">
          {measure.length === 0 && 'Miarka: kliknij punkt początkowy P1'}
          {measure.length === 1 && 'Miarka: kliknij punkt końcowy P2'}
          {measure.length === 2 && (
            <span>
              ΔX <strong className="font-semibold text-fg">{formatMm(Math.abs(measure[1].x - measure[0].x))}</strong> · ΔY{' '}
              <strong className="font-semibold text-fg">{formatMm(Math.abs(measure[1].y - measure[0].y))}</strong> · L{' '}
              <strong className="font-semibold text-accent-text">
                {formatMm(Math.hypot(measure[1].x - measure[0].x, measure[1].y - measure[0].y))} mm
              </strong>
            </span>
          )}
          <span className="ml-3 text-subtle">PPM – wyczyść · Esc – zakończ</span>
        </div>
      )}

      {layer.items.length === 0 && activeLayer === 'A' && tool === 'select' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="pointer-events-auto w-[380px] max-w-full animate-pop rounded-2xl border border-line bg-panel/95 p-6 text-center shadow-pop backdrop-blur">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
              <Sparkles size={22} />
            </div>
            <h3 className="text-[15px] font-semibold">Warstwa A jest pusta</h3>
            <p className="mt-1 text-[12.5px] text-muted">
              Wygeneruj układ automatycznie na podstawie wymiarów palety i produktu albo dodawaj produkty ręcznie.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="primary" icon={<Sparkles size={15} />} onClick={() => useStore.getState().openDialog('generator')}>
                Generator układu
              </Button>
              <div className="flex gap-2">
                <Button block icon={<SquarePlus size={15} />} onClick={() => useStore.getState().addItem()}>
                  Dodaj produkt
                </Button>
                <Button block onClick={loadExample}>
                  Wczytaj przykład
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CanvasViewOptions />

      <div className="absolute right-3 bottom-3 flex items-center gap-0.5 rounded-xl border border-line bg-panel/95 p-1 shadow-pop backdrop-blur">
        <IconButton label="Pomniejsz" shortcut="−" size="sm" tipSide="top" onClick={() => zoomAt(1 / 1.25)}>
          <Minus size={15} />
        </IconButton>
        <button
          type="button"
          className="tip h-7 min-w-13 rounded-lg px-1.5 text-[12px] font-medium text-muted tabular-nums hover:bg-hover hover:text-fg"
          data-tip="Dopasuj do okna (F)"
          data-tip-side="top"
          onClick={fit}
        >
          {Math.round(zoom * 100)}%
        </button>
        <IconButton label="Powiększ" shortcut="+" size="sm" tipSide="top" onClick={() => zoomAt(1.25)}>
          <Plus size={15} />
        </IconButton>
        <div className="mx-0.5 h-4 w-px bg-line" />
        <IconButton label="Dopasuj do okna" shortcut="F" size="sm" tipSide="top" tipAlign="end" onClick={fit}>
          <Maximize size={14} />
        </IconButton>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- elementy rysunku */

const ITEM_COLORS = {
  A: { fill: 'var(--item-a)', edge: 'var(--item-a-edge)', text: 'var(--item-a-text)' },
  B: { fill: 'var(--item-b)', edge: 'var(--item-b-edge)', text: 'var(--item-b-text)' },
  error: { fill: 'var(--item-error)', edge: 'var(--item-error-edge)', text: 'var(--item-error-text)' },
  warning: { fill: 'var(--item-warning)', edge: 'var(--item-warning-edge)', text: 'var(--item-warning-text)' },
}

function ItemShape({
  item,
  layer,
  kind,
  length,
  width,
  cx: centerX,
  cy: centerY,
  selected,
  state,
  section,
  interactive,
  dimmed,
}: {
  item: Placement
  layer: 'A' | 'B'
  kind: 'worek' | 'karton'
  length: number
  width: number
  cx: number
  cy: number
  selected: boolean
  state: 'ok' | 'warning' | 'error'
  section?: 1 | 2
  interactive: boolean
  dimmed: boolean
}) {
  const colors = state === 'ok' ? ITEM_COLORS[layer] : ITEM_COLORS[state]
  const radius = kind === 'worek' ? Math.min(12, width * 0.18) : Math.min(4, width * 0.08)
  const fontSize = Math.max(11, Math.min(30, Math.min(length, width) * 0.34))
  const marker = Math.max(4, Math.min(9, width * 0.12))
  const horizontal = item.rotation % 180 === 0
  const w = horizontal ? length : width
  const h = horizontal ? width : length

  return (
    <g
      data-item-id={item.id}
      data-order={item.order}
      data-selected={selected || undefined}
      data-state={state}
      pointerEvents={interactive ? 'auto' : 'none'}
      opacity={dimmed ? 0.55 : 1}
      style={{ cursor: interactive ? 'move' : undefined }}
    >
      {selected && (
        <rect
          x={centerX - w / 2 - 3}
          y={centerY - h / 2 - 3}
          width={w + 6}
          height={h + 6}
          rx={radius + 3}
          fill="none"
          stroke="color-mix(in srgb, var(--accent) 42%, transparent)"
          strokeWidth={5}
        />
      )}
      {/* Obrót przeciwny do zegara patrząc z góry – w SVG oś Y jest skierowana w dół. */}
      <g transform={`translate(${centerX} ${centerY}) rotate(${-item.rotation})`}>
        <rect
          x={-length / 2 + 0.75}
          y={-width / 2 + 0.75}
          width={Math.max(1, length - 1.5)}
          height={Math.max(1, width - 1.5)}
          rx={radius}
          fill={selected ? `color-mix(in srgb, var(--accent) 24%, ${colors.fill})` : colors.fill}
          stroke={selected ? 'var(--accent)' : colors.edge}
          strokeWidth={selected ? 2.5 : 1.5}
        />
        {kind === 'worek' ? (
          <>
            <line x1={-length / 2 + length * 0.07} x2={-length / 2 + length * 0.07} y1={-width / 2 + 5} y2={width / 2 - 5} stroke={colors.edge} strokeOpacity={0.35} strokeDasharray="3 3" />
            <line x1={length / 2 - length * 0.07} x2={length / 2 - length * 0.07} y1={-width / 2 + 5} y2={width / 2 - 5} stroke={colors.edge} strokeOpacity={0.35} strokeDasharray="3 3" />
          </>
        ) : (
          <line x1={-length / 2 + 2} x2={length / 2 - 2} y1={0} y2={0} stroke={colors.edge} strokeOpacity={0.22} strokeWidth={Math.max(2, width * 0.08)} />
        )}
        {/* Znacznik przodu produktu (kierunek obrotu 0°). */}
        <path
          d={`M ${length / 2 - marker * 2.4} ${-marker} L ${length / 2 - marker * 1.1} 0 L ${length / 2 - marker * 2.4} ${marker} Z`}
          fill={colors.edge}
          fillOpacity={0.75}
        />
      </g>
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={700}
        fill={colors.text}
        style={{ fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
      >
        {item.order}
      </text>
      {section && Math.min(w, h) > 44 && (
        <g pointerEvents="none">
          <rect x={centerX - w / 2 + 6} y={centerY - h / 2 + 6} width={24} height={15} rx={4} fill={section === 1 ? 'var(--accent)' : 'var(--warning)'} />
          <text x={centerX - w / 2 + 18} y={centerY - h / 2 + 14} textAnchor="middle" dominantBaseline="central" fontSize={9.5} fontWeight={700} fill="#fff">
            S{section}
          </text>
        </g>
      )}
    </g>
  )
}

function AxisArrow({ x, y, dir, color, label }: { x: number; y: number; dir: readonly [number, number]; color: string; label: string }) {
  const len = 62
  const ex = x + dir[0] * len
  const ey = y + dir[1] * len
  const px = -dir[1]
  const py = dir[0]
  const head = 8
  return (
    <g>
      <line x1={x} y1={y} x2={ex} y2={ey} stroke="var(--panel)" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path
        d={`M ${ex + dir[0] * head} ${ey + dir[1] * head} L ${ex + px * head * 0.62} ${ey + py * head * 0.62} L ${ex - px * head * 0.62} ${ey - py * head * 0.62} Z`}
        fill={color}
        stroke="var(--panel)"
        strokeWidth={1}
      />
      <text
        x={ex + dir[0] * 22}
        y={ey + dir[1] * 20}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={color}
        stroke="var(--panel)"
        strokeWidth={3}
        paintOrder="stroke"
      >
        {label}
      </text>
    </g>
  )
}

function CornerLabels({ pallet, sx, sy }: { pallet: Pallet; sx: (x: number) => number; sy: (y: number) => number }) {
  const offsets: Record<Corner, [number, number]> = { A: [-1, -1], B: [1, -1], C: [1, 1], D: [-1, 1] }
  return (
    <g pointerEvents="none">
      {CORNERS.map((corner) => {
        const p = cornerPoint(pallet, corner)
        const [ox, oy] = offsets[corner]
        const isBase = corner === pallet.baseCorner
        const x = sx(p.x) + ox * 17
        const y = sy(p.y) + oy * 17
        return (
          <g key={corner} data-corner={corner} data-base={isBase || undefined}>
            <circle cx={x} cy={y} r={11} fill={isBase ? 'var(--fg)' : 'var(--panel)'} stroke={isBase ? 'var(--fg)' : 'var(--line-strong)'} strokeWidth={1} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontWeight={700} fill={isBase ? 'var(--panel)' : 'var(--muted)'}>
              {corner}
            </text>
            {isBase && (
              <text
                x={x + ox * 17}
                y={y}
                textAnchor={ox < 0 ? 'end' : 'start'}
                dominantBaseline="central"
                fontSize={10.5}
                fontWeight={700}
                letterSpacing="0.08em"
                fill="var(--fg)"
              >
                BASE
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

function Dimensions({ pallet, sx, sy }: { pallet: Pallet; sx: (x: number) => number; sy: (y: number) => number }) {
  const top = sy(0) - 44
  const left = sx(0) - 44
  const x1 = sx(0)
  const x2 = sx(pallet.length)
  const y1 = sy(0)
  const y2 = sy(pallet.width)
  const stroke = 'var(--subtle)'
  const label = (text: string) => text.length * 6.6 + 16
  const lengthText = `${formatMm(pallet.length)} mm`
  const widthText = `${formatMm(pallet.width)} mm`
  return (
    <g pointerEvents="none" fontSize={11.5} fontWeight={600} fill="var(--muted)">
      <line x1={x1} x2={x2} y1={top} y2={top} stroke={stroke} strokeWidth={1} />
      <line x1={x1} x2={x1} y1={top - 5} y2={top + 5} stroke={stroke} strokeWidth={1} />
      <line x1={x2} x2={x2} y1={top - 5} y2={top + 5} stroke={stroke} strokeWidth={1} />
      <rect x={(x1 + x2) / 2 - label(lengthText) / 2} y={top - 10} width={label(lengthText)} height={20} rx={10} fill="var(--canvas)" />
      <text x={(x1 + x2) / 2} y={top} textAnchor="middle" dominantBaseline="central">
        {lengthText}
      </text>

      <line x1={left} x2={left} y1={y1} y2={y2} stroke={stroke} strokeWidth={1} />
      <line x1={left - 5} x2={left + 5} y1={y1} y2={y1} stroke={stroke} strokeWidth={1} />
      <line x1={left - 5} x2={left + 5} y1={y2} y2={y2} stroke={stroke} strokeWidth={1} />
      <g transform={`translate(${left} ${(y1 + y2) / 2}) rotate(-90)`}>
        <rect x={-label(widthText) / 2} y={-10} width={label(widthText)} height={20} rx={10} fill="var(--canvas)" />
        <text x={0} y={0} textAnchor="middle" dominantBaseline="central">
          {widthText}
        </text>
      </g>
    </g>
  )
}

function MeasureDot({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={5} fill="var(--panel)" stroke="var(--accent)" strokeWidth={2} />
      <text x={x + 9} y={y - 11} fontSize={11.5} fontWeight={700} fill="var(--accent)" stroke="var(--panel)" strokeWidth={3} paintOrder="stroke">
        {label}
      </text>
    </g>
  )
}

function MeasureLine({ a, b, sx, sy, final }: { a: Point; b: Point; sx: (x: number) => number; sy: (y: number) => number; final: boolean }) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  const mx = (sx(a.x) + sx(b.x)) / 2
  const my = (sy(a.y) + sy(b.y)) / 2
  const text = `${formatMm(length)} mm`
  const w = text.length * 6.8 + 16
  return (
    <g>
      {final && Math.abs(dx) > 1e-6 && Math.abs(dy) > 1e-6 && (
        <path
          d={`M ${sx(a.x)} ${sy(a.y)} L ${sx(b.x)} ${sy(a.y)} L ${sx(b.x)} ${sy(b.y)}`}
          fill="none"
          stroke="var(--accent)"
          strokeOpacity={0.45}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      <line x1={sx(a.x)} y1={sy(a.y)} x2={sx(b.x)} y2={sy(b.y)} stroke="var(--accent)" strokeWidth={2} strokeDasharray={final ? undefined : '6 4'} />
      <rect x={mx - w / 2} y={my - 24} width={w} height={19} rx={9.5} fill="var(--accent)" />
      <text x={mx} y={my - 14.5} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontWeight={700} fill="var(--accent-fg)">
        {text}
      </text>
    </g>
  )
}
