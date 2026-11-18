import { createProject } from './defaults'
import { generatePatterns } from './generator'
import { formatCycles, autoPairCycles } from './gripper'
import { syncLinkedLayers } from './layers'
import type { Project } from './types'

/** Projekt przykładowy: worki 25 kg na palecie EUR, układ 3+2 z warstwą B obróconą o 180°. */
export function createExampleProject(): Project {
  const project = createProject('Worki 25 kg – paleta 1200 × 1000')
  project.pallet.width = 1000
  project.product = {
    kind: 'worek',
    length: 600,
    width: 400,
    height: 120,
    layerIncrement: 120,
    allowOverhang: true,
    maxOverhang: 30,
    allowOverlap: true,
    maxOverlap: 20,
  }
  project.robot.layers = 8
  project.robot.firstZ = -120
  const patterns = generatePatterns(project.pallet, project.product)
  const pattern = patterns.find((p) => p.kind === 'split-y' || p.kind === 'split-x') ?? patterns[0]
  if (pattern) project.layers.A.items = pattern.items
  project.layers.B = { name: 'B', items: [], link: 'rot180' }
  syncLinkedLayers(project)
  project.robot.pickMode = 'pojedynczy'
  project.robot.assignments = formatCycles(autoPairCycles(project.layers.A.items.map((i) => i.order)))
  return project
}
