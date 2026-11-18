import { layerZOffset, slipSheetsBelow } from './asExport'
import { overhang, placementRect } from './geometry'
import { projectCycles } from './gripper'
import { layerSequence } from './layers'
import type { Project } from './types'

export interface ProjectStats {
  perLayerA: number
  perLayerB: number
  totalProducts: number
  layers: number
  /** Wysokość stosu ponad paletę [mm], z przekładkami. */
  stackHeight: number
  slipSheets: number
  /** Wypełnienie powierzchni palety przez warstwę A (0..1). */
  fill: number
  maxOverhang: number
  cyclesPerLayer: number
  totalCycles: number
}

export function projectStats(project: Project): ProjectStats {
  const seq = layerSequence(project)
  const a = project.layers.A.items.length
  const b = project.layers.B?.items.length ?? 0
  const totalProducts = seq.reduce((sum, name) => sum + (name === 'B' ? b : a), 0)
  const layers = seq.length
  const stackHeight = layerZOffset(project, layers) + project.product.layerIncrement
  const { pallet, product } = project

  let covered = 0
  let maxOverhang = 0
  for (const item of project.layers.A.items) {
    const r = placementRect(item, product)
    const w = Math.max(0, Math.min(r.x2, pallet.length) - Math.max(r.x1, 0))
    const h = Math.max(0, Math.min(r.y2, pallet.width) - Math.max(r.y1, 0))
    covered += w * h
    maxOverhang = Math.max(maxOverhang, overhang(r, pallet))
  }
  const cyclesPerLayer = projectCycles(project).cycles.length

  return {
    perLayerA: a,
    perLayerB: b,
    totalProducts,
    layers,
    stackHeight,
    slipSheets: slipSheetsBelow(project, layers),
    fill: pallet.length > 0 && pallet.width > 0 ? Math.min(1, covered / (pallet.length * pallet.width)) : 0,
    maxOverhang,
    cyclesPerLayer,
    totalCycles: cyclesPerLayer * layers,
  }
}
