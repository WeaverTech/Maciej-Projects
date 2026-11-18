import type { Layer, Pallet, Product, Project, Robot, SlipSheet } from './types'

export const APP_NAME = 'Kawasaki Palletizer'
export const APP_VERSION = '3.0.0'
export const PROJECT_FORMAT_VERSION = 4

export function defaultPallet(): Pallet {
  return { length: 1200, width: 800, baseCorner: 'D', xDirection: 'prawo', yDirection: 'gora' }
}

export function defaultProduct(): Product {
  return {
    kind: 'worek',
    length: 600,
    width: 400,
    height: 100,
    layerIncrement: 100,
    allowOverhang: true,
    maxOverhang: 30,
    allowOverlap: true,
    maxOverlap: 20,
  }
}

export function defaultRobot(): Robot {
  return {
    programName: 'paletyzacja',
    baseName: 'poczatekpal',
    pickup: 'pobierz',
    pickupApproach: 'pobierz_najazd',
    layers: 7,
    firstZ: -100,
    safeZ: 500,
    speed: 100,
    accel: 100,
    decel: 100,
    pickMode: 'pojedynczy',
    s1Name: 'Sekcja 1',
    s1On: '12,-13',
    s1Off: '-12,13',
    s2Name: 'Sekcja 2',
    s2On: '10,-11',
    s2Off: '-10,11',
    assignments: '1=1,2=2;3=1,4=2;5=1,6=2',
    gripWait: 0.5,
    releaseWait: 0.2,
    orientationMode: 'base',
    oOffset: 0,
  }
}

export function defaultSlipSheet(): SlipSheet {
  return { enabled: false, thickness: 3, every: 1, callProgram: '' }
}

export function emptyLayer(name: 'A' | 'B'): Layer {
  return { name, items: [], link: null }
}

export function createProject(name = 'Nowy projekt'): Project {
  return {
    version: PROJECT_FORMAT_VERSION,
    name,
    pallet: defaultPallet(),
    product: defaultProduct(),
    layers: { A: emptyLayer('A') },
    robot: defaultRobot(),
    slipSheet: defaultSlipSheet(),
  }
}

export interface PalletPreset {
  id: string
  label: string
  length: number
  width: number
}

export const PALLET_PRESETS: PalletPreset[] = [
  { id: 'eur1', label: 'EUR 1 · 1200 × 800', length: 1200, width: 800 },
  { id: 'eur2', label: 'EUR 2 · 1200 × 1000', length: 1200, width: 1000 },
  { id: 'eur3', label: 'EUR 3 · 1000 × 1200', length: 1000, width: 1200 },
  { id: 'eur6', label: 'EUR 6 · 800 × 600', length: 800, width: 600 },
  { id: 'cp1', label: 'CP1 · 1200 × 1000', length: 1200, width: 1000 },
  { id: 'cp3', label: 'CP3 · 1140 × 1140', length: 1140, width: 1140 },
  { id: 'us', label: 'US · 1219 × 1016', length: 1219, width: 1016 },
]
