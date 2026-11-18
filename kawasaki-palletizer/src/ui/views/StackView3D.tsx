import { Box, Pause, Play, RotateCcw, ScanEye, SquareArrowDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { layerZOffset, slipSheetsBelow } from '../../core/asExport'
import { formatMm, layersLabel, productsLabel } from '../../core/format'
import { axesValid, cornerPoint, CORNERS, origin, VECTORS, zAxisDirection } from '../../core/geometry'
import { getLayer, layerSequence, sortedByOrder } from '../../core/layers'
import type { Project } from '../../core/types'
import { useStore } from '../../state/store'
import { useResolvedTheme, useStats } from '../hooks'
import { IconButton } from '../kit'

const MM = 0.001
const PALLET_HEIGHT = 144

interface Engine {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  content: THREE.Group
  ground: THREE.Mesh
  sun: THREE.DirectionalLight
  /** Czy kamera została już ustawiona względem stosu. */
  framed: boolean
  render: () => void
}

interface Built {
  /** Siatki produktów w kolejności układania (warstwa po warstwie). */
  products: THREE.Mesh[]
  /** Przekładki z indeksem produktu, po którym się pojawiają. */
  sheets: { mesh: THREE.Mesh; after: number }[]
  center: THREE.Vector3
  radius: number
  top: number
}

type Palette = Record<'bg' | 'ground' | 'wood' | 'woodDark' | 'a' | 'b' | 'active' | 'sheet' | 'edge', string>

const PALETTES: Record<'light' | 'dark', Palette> = {
  light: { bg: '#e9edf3', ground: '#dfe4ec', wood: '#dcbb86', woodDark: '#c39f66', a: '#9db4ff', b: '#c3b2ff', active: '#ffb648', sheet: '#b88d55', edge: '#2a3a7c' },
  dark: { bg: '#080b10', ground: '#0e131c', wood: '#8a6c42', woodDark: '#6b5231', a: '#4f6bd6', b: '#8468e0', active: '#f2a93b', sheet: '#6e5632', edge: '#0b1020' },
}

function disposeGroup(group: THREE.Object3D) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    mesh.geometry?.dispose()
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined
    for (const m of Array.isArray(material) ? material : material ? [material] : []) {
      const map = (m as THREE.SpriteMaterial).map
      map?.dispose()
      m.dispose()
    }
  })
  group.clear()
}

function label(text: string, color: string, size = 0.09, overlay = true): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(64, 64, 54, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '700 72px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 64, 69)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: !overlay, transparent: true }))
  sprite.scale.setScalar(size)
  sprite.renderOrder = 10
  return sprite
}

function buildPallet(project: Project, palette: Palette): THREE.Group {
  const { length: L, width: W } = project.pallet
  const group = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({ color: palette.wood, roughness: 0.85 })
  const dark = new THREE.MeshStandardMaterial({ color: palette.woodDark, roughness: 0.9 })
  const add = (x: number, y: number, z: number, sx: number, sy: number, sz: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx * MM, sy * MM, sz * MM), material)
    mesh.position.set((x + sx / 2) * MM, (y + sy / 2) * MM, (z + sz / 2) * MM)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }
  const board = 22
  const block = PALLET_HEIGHT - 3 * board
  const blockL = Math.min(145, L / 5)
  const blockW = Math.min(145, W / 5)
  const xs = [0, (L - blockL) / 2, L - blockL]
  const zs = [0, (W - blockW) / 2, W - blockW]
  // Deski dolne, klocki, deski poprzeczne i pokład.
  for (const z of zs) add(0, 0, z, L, board, blockW, dark)
  for (const x of xs) for (const z of zs) add(x, board, z, blockL, block, blockW, dark)
  for (const x of xs) add(x, board + block, 0, blockL, board, W, dark)
  const deckCount = Math.max(3, Math.round(W / 190))
  const deckW = (W / deckCount) * 0.78
  for (let i = 0; i < deckCount; i++) {
    const z = deckCount === 1 ? 0 : (i * (W - deckW)) / (deckCount - 1)
    add(0, PALLET_HEIGHT - board, z, L, board, deckW, wood)
  }
  return group
}

function buildStack(project: Project, palette: Palette): { group: THREE.Group; built: Built } {
  const group = new THREE.Group()
  const { pallet, product } = project
  group.add(buildPallet(project, palette))

  const bag = product.kind === 'worek'
  const visualHeight = Math.max(5, product.layerIncrement > 0 ? Math.min(product.height, product.layerIncrement) : product.height)
  const seam = bag ? 3 : 1.5
  const sx = Math.max(4, product.length - 2 * seam) * MM
  const sy = Math.max(2, visualHeight - (bag ? 2 : 0.5)) * MM
  const sz = Math.max(4, product.width - 2 * seam) * MM
  const geometry = bag
    ? new RoundedBoxGeometry(sx, sy, sz, 4, Math.min(sy * 0.45, sx * 0.2, sz * 0.2, 0.04))
    : new THREE.BoxGeometry(sx, sy, sz)
  const edges = bag ? null : new THREE.EdgesGeometry(geometry)
  const edgeMaterial = new THREE.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.35 })
  const materials = {
    A: new THREE.MeshStandardMaterial({ color: palette.a, roughness: bag ? 0.9 : 0.65 }),
    B: new THREE.MeshStandardMaterial({ color: palette.b, roughness: bag ? 0.9 : 0.65 }),
  }
  const sheetMaterial = new THREE.MeshStandardMaterial({ color: palette.sheet, roughness: 0.95 })

  const products: THREE.Mesh[] = []
  const sheets: Built['sheets'] = []
  const sequence = layerSequence(project)
  let top = PALLET_HEIGHT

  sequence.forEach((name, idx) => {
    const j = idx + 1
    const z0 = PALLET_HEIGHT + layerZOffset(project, j)
    if (j > 1 && slipSheetsBelow(project, j) > slipSheetsBelow(project, j - 1)) {
      const t = Math.max(1, project.slipSheet.thickness)
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(pallet.length * MM, t * MM, pallet.width * MM), sheetMaterial)
      mesh.position.set((pallet.length / 2) * MM, (z0 - t / 2) * MM, (pallet.width / 2) * MM)
      mesh.receiveShadow = true
      group.add(mesh)
      sheets.push({ mesh, after: products.length })
    }
    for (const item of sortedByOrder(getLayer(project, name).items)) {
      const mesh = new THREE.Mesh(geometry, materials[name])
      mesh.position.set(item.x * MM, (z0 + visualHeight / 2) * MM, item.y * MM)
      mesh.rotation.y = (item.rotation * Math.PI) / 180
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData.layer = name
      if (edges) mesh.add(new THREE.LineSegments(edges, edgeMaterial))
      group.add(mesh)
      products.push(mesh)
    }
    top = z0 + visualHeight
  })

  // Układ BASE na wysokości pokładu palety.
  if (axesValid(pallet)) {
    const o = origin(pallet)
    const at = new THREE.Vector3(o.x * MM, (PALLET_HEIGHT + 4) * MM, o.y * MM)
    const len = Math.min(pallet.length, pallet.width) * 0.32 * MM
    const vx = VECTORS[pallet.xDirection]
    const vy = VECTORS[pallet.yDirection]
    const axes: [THREE.Vector3, string, string][] = [
      [new THREE.Vector3(vx[0], 0, vx[1]), '#e5484d', 'X'],
      [new THREE.Vector3(vy[0], 0, vy[1]), '#1f9d55', 'Y'],
      [new THREE.Vector3(0, zAxisDirection(pallet) === 'down' ? -1 : 1, 0), '#3d5afe', 'Z'],
    ]
    for (const [dir, color, name] of axes) {
      const arrow = new THREE.ArrowHelper(dir, at, len, color, len * 0.22, len * 0.1)
      arrow.traverse((o3) => {
        const m = (o3 as THREE.Mesh).material as THREE.Material | undefined
        if (m) {
          m.depthTest = false
          m.transparent = true
        }
        o3.renderOrder = 9
      })
      group.add(arrow)
      const sprite = label(name, color, 0.075)
      sprite.position.copy(at).addScaledVector(dir, len + 0.06)
      group.add(sprite)
    }
  }
  for (const corner of CORNERS) {
    const p = cornerPoint(pallet, corner)
    const sprite = label(corner, corner === pallet.baseCorner ? '#3d5afe' : '#7b8698', 0.085, false)
    const outX = p.x === 0 ? -70 : 70
    const outZ = p.y === 0 ? -70 : 70
    sprite.position.set((p.x + outX) * MM, 0.045, (p.y + outZ) * MM)
    group.add(sprite)
  }

  const center = new THREE.Vector3((pallet.length / 2) * MM, (top / 2) * MM, (pallet.width / 2) * MM)
  const radius = Math.hypot(pallet.length, pallet.width, top) * 0.5 * MM
  return { group, built: { products, sheets, center, radius, top } }
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function applyProgress(built: Built, shown: number) {
  built.products.forEach((mesh, idx) => {
    mesh.visible = idx < shown
  })
  for (const sheet of built.sheets) sheet.mesh.visible = sheet.after < shown || shown >= built.products.length
}

type CameraPreset = 'iso' | 'top' | 'front'

function placeCamera(engine: Engine, built: Built, preset: CameraPreset) {
  const { camera, controls } = engine
  const fov = (camera.fov * Math.PI) / 180
  const fit = built.radius / Math.sin(Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect)) / 2)
  const distance = fit * 1.25
  const dir =
    preset === 'top'
      ? new THREE.Vector3(0, 1, 0.001)
      : preset === 'front'
        ? new THREE.Vector3(0, 0.25, 1)
        : new THREE.Vector3(0.85, 0.72, 1)
  camera.position.copy(built.center).addScaledVector(dir.normalize(), distance)
  camera.near = distance / 100
  camera.far = distance * 20
  camera.updateProjectionMatrix()
  controls.target.copy(built.center)
  controls.update()
}

export function StackView3D() {
  const project = useStore((s) => s.project)
  const theme = useResolvedTheme()
  const stats = useStats()
  const hostRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const builtRef = useRef<Built | null>(null)
  const [failed] = useState(() => !webglAvailable())
  /** Liczba ułożonych produktów w podglądzie; `null` = cały stos. */
  const [progress, setProgress] = useState<number | null>(null)
  const [playRequested, setPlayRequested] = useState(false)

  const layerEnds = useMemo(
    () =>
      layerSequence(project).reduce<number[]>((ends, name) => {
        ends.push((ends[ends.length - 1] ?? 0) + getLayer(project, name).items.length)
        return ends
      }, []),
    [project],
  )
  const total = layerEnds[layerEnds.length - 1] ?? 0
  const shown = progress === null ? total : Math.min(progress, total)
  const playing = playRequested && shown < total

  /* silnik renderujący – tworzony raz */
  useEffect(() => {
    const host = hostRef.current
    if (!host || failed) return
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    host.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    renderer.domElement.setAttribute('data-testid', 'stack-canvas')

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxPolarAngle = Math.PI / 2 - 0.02
    controls.zoomSpeed = 0.9

    scene.add(new THREE.HemisphereLight('#ffffff', '#8d98ad', 1.25))
    const sun = new THREE.DirectionalLight('#ffffff', 1.9)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.01
    scene.add(sun, sun.target)

    const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 72), new THREE.MeshStandardMaterial({ roughness: 1 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.001
    ground.receiveShadow = true
    scene.add(ground)

    const content = new THREE.Group()
    scene.add(content)

    let frame = 0
    const render = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        renderer.render(scene, camera)
      })
    }
    controls.addEventListener('change', render)

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (w < 2 || h < 2) return
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    engineRef.current = { renderer, scene, camera, controls, content, ground, sun, framed: false, render }

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      controls.dispose()
      disposeGroup(content)
      ground.geometry.dispose()
      ;(ground.material as THREE.Material).dispose()
      renderer.dispose()
      renderer.domElement.remove()
      engineRef.current = null
    }
  }, [failed])

  /* przebudowa sceny po zmianie projektu lub motywu */
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const palette = PALETTES[theme]
    disposeGroup(engine.content)
    const { group, built } = buildStack(project, palette)
    engine.content.add(group)
    builtRef.current = built

    engine.scene.background = new THREE.Color(palette.bg)
    ;(engine.ground.material as THREE.MeshStandardMaterial).color.set(palette.ground)
    engine.ground.scale.setScalar(built.radius * 3.2)
    engine.ground.position.set(built.center.x, -0.001, built.center.z)

    const sun = engine.sun
    const r = built.radius * 1.6
    sun.position.set(built.center.x + r * 0.7, built.center.y + r * 1.6, built.center.z + r * 0.9)
    sun.target.position.copy(built.center)
    const cam = sun.shadow.camera
    cam.left = cam.bottom = -r
    cam.right = cam.top = r
    cam.near = 0.01
    cam.far = r * 6
    cam.updateProjectionMatrix()

    if (!engine.framed) {
      placeCamera(engine, built, 'iso')
      engine.framed = true
    } else {
      engine.controls.target.copy(built.center)
      engine.controls.update()
    }
    engine.render()
  }, [project, theme])

  /* widoczność produktów */
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !builtRef.current) return
    applyProgress(builtRef.current, shown)
    engine.render()
  }, [shown, theme, project])

  /* animacja układania */
  useEffect(() => {
    if (!playing) return
    const interval = Math.max(40, Math.min(260, 9000 / Math.max(1, total)))
    const timer = setInterval(() => setProgress((p) => (p === null ? null : p + 1)), interval)
    return () => clearInterval(timer)
  }, [playing, total])

  const position = useMemo(() => {
    if (shown === 0 || layerEnds.length === 0) return { layer: 0, inLayer: 0, layerSize: 0 }
    const layer = layerEnds.findIndex((end) => shown <= end)
    const start = layer > 0 ? layerEnds[layer - 1] : 0
    return { layer: layer + 1, inLayer: shown - start, layerSize: layerEnds[layer] - start }
  }, [shown, layerEnds])

  const setCamera = (preset: CameraPreset) => {
    const engine = engineRef.current
    const built = builtRef.current
    if (engine && built) placeCamera(engine, built, preset)
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-canvas" data-testid="stack-view">
      <div ref={hostRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <div className="max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-pop">
            <Box size={28} className="mx-auto text-subtle" />
            <p className="mt-3 text-[14px] font-semibold">Podgląd 3D jest niedostępny</p>
            <p className="mt-1 text-[12.5px] text-muted">Przeglądarka nie udostępnia WebGL. Pozostałe funkcje aplikacji działają bez zmian.</p>
          </div>
        </div>
      )}

      <div className="no-print pointer-events-none absolute top-3 left-3 rounded-xl border border-line bg-panel/90 px-3.5 py-2.5 shadow-soft backdrop-blur" data-testid="stack-stats">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Stos</p>
        <p className="mt-0.5 text-[18px] leading-tight font-semibold tabular-nums">{productsLabel(stats.totalProducts)}</p>
        <p className="text-[12px] text-muted tabular-nums">
          {layersLabel(stats.layers)} · wysokość ładunku {formatMm(stats.stackHeight, 0)} mm
        </p>
        {stats.slipSheets > 0 && <p className="text-[12px] text-muted">przekładki: {stats.slipSheets}</p>}
        <div className="mt-2 flex items-center gap-3 text-[11.5px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px]" style={{ background: PALETTES[theme].a }} /> warstwa A
          </span>
          {project.layers.B && (
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: PALETTES[theme].b }} /> warstwa B
            </span>
          )}
        </div>
      </div>

      <div className="no-print absolute top-3 right-3 flex gap-0.5 rounded-xl border border-line bg-panel/90 p-1 shadow-soft backdrop-blur">
        <IconButton label="Widok izometryczny" size="sm" onClick={() => setCamera('iso')}>
          <Box size={15} />
        </IconButton>
        <IconButton label="Widok z góry" size="sm" onClick={() => setCamera('top')}>
          <SquareArrowDown size={15} />
        </IconButton>
        <IconButton label="Widok z przodu" size="sm" tipAlign="end" onClick={() => setCamera('front')}>
          <ScanEye size={15} />
        </IconButton>
      </div>

      {total > 0 ? (
        <div className="no-print absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="flex w-full max-w-[640px] items-center gap-3 rounded-2xl border border-line bg-panel/92 py-2 pr-4 pl-2 shadow-pop backdrop-blur">
            <button
              type="button"
              aria-label={playing ? 'Wstrzymaj animację' : 'Odtwórz układanie'}
              data-testid="stack-play"
              onClick={() => {
                if (playing) {
                  setPlayRequested(false)
                } else {
                  setProgress(shown >= total ? 0 : shown)
                  setPlayRequested(true)
                }
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg shadow-soft transition-colors hover:bg-accent-hover"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-px" />}
            </button>
            <IconButton
              label="Pokaż cały stos"
              size="sm"
              tipSide="top"
              onClick={() => {
                setPlayRequested(false)
                setProgress(null)
              }}
            >
              <RotateCcw size={15} />
            </IconButton>
            <input
              type="range"
              aria-label="Postęp układania"
              data-testid="stack-slider"
              min={0}
              max={total}
              value={shown}
              onChange={(e) => {
                setPlayRequested(false)
                setProgress(Number(e.target.value))
              }}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-(--accent)"
            />
            <div className="w-44 shrink-0 text-right text-[12px] leading-tight tabular-nums" data-testid="stack-progress">
              <p className="font-semibold">
                {shown} / {total} szt.
              </p>
              <p className="text-muted">
                {position.layer > 0 ? `warstwa ${position.layer} z ${layerEnds.length} · ${position.inLayer}/${position.layerSize}` : 'pusta paleta'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        !failed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <p className="rounded-xl border border-line bg-panel/90 px-4 py-2 text-[12.5px] text-muted shadow-soft">
              Warstwa A jest pusta – ułóż produkty w widoku „Układ 2D”.
            </p>
          </div>
        )
      )}
    </div>
  )
}
