import { describe, expect, it } from 'vitest'
import { createProject } from '../../src/core/defaults'
import { createExampleProject } from '../../src/core/example'
import { rotatedLayerB, syncLinkedLayers } from '../../src/core/layers'
import type { Placement, Project } from '../../src/core/types'
import { countIssues, issueItemSets, validateGeometry, validateOrder, validateProject } from '../../src/core/validation'

const item = (id: number, x: number, y: number, rotation: Placement['rotation'] = 0, order = id): Placement => ({ id, x, y, rotation, order })

function twoBags(): Project {
  const p = createProject()
  p.layers.A.items = [item(1, 300, 200), item(2, 900, 200)]
  return p
}

describe('walidacja geometrii', () => {
  it('poprawny układ nie zgłasza problemów', () => {
    expect(validateGeometry(twoBags(), 'A')).toEqual([])
    expect(validateProject(twoBags())).toEqual([])
  })

  it('produkty stykające się krawędziami nie kolidują (brak błędów 0.0 mm)', () => {
    const p = createProject()
    p.product.kind = 'karton'
    p.product.length = 0.1 + 0.2
    p.product.width = 0.3
    p.pallet.length = 10
    p.pallet.width = 10
    p.layers.A.items = [item(1, 0.15, 0.15), item(2, 0.15 + 0.1 + 0.2, 0.15)]
    expect(validateGeometry(p, 'A')).toEqual([])
  })

  it('worek: wystawanie w limicie to ostrzeżenie, poza limitem błąd', () => {
    const p = twoBags()
    p.layers.A.items[0].x = 270
    expect(validateGeometry(p, 'A').map((i) => i.severity)).toEqual(['warning'])
    p.layers.A.items[0].x = 269
    expect(validateGeometry(p, 'A').map((i) => i.severity)).toEqual(['error'])
    p.layers.A.items[0].x = 270
    p.product.allowOverhang = false
    expect(validateGeometry(p, 'A').map((i) => i.severity)).toEqual(['error'])
  })

  it('worek: nakładanie w limicie to ostrzeżenie, poza limitem błąd', () => {
    const p = twoBags()
    p.layers.A.items[1].x = 880
    expect(validateGeometry(p, 'A').map((i) => i.severity)).toEqual(['warning'])
    p.layers.A.items[1].x = 879
    expect(validateGeometry(p, 'A').map((i) => i.severity)).toEqual(['error'])
    p.layers.A.items[1].x = 880
    p.product.allowOverlap = false
    expect(validateGeometry(p, 'A').map((i) => i.severity)).toEqual(['error'])
  })

  it('karton nie może wystawać ani się nakładać', () => {
    const p = twoBags()
    p.product.kind = 'karton'
    p.layers.A.items[0].x = 295
    p.layers.A.items[1].x = 890
    const issues = validateGeometry(p, 'A')
    expect(issues.map((i) => i.severity)).toEqual(['error', 'error'])
    expect(issues[1].itemIds).toEqual([1, 2])
  })

  it('zbiory produktów do kolorowania', () => {
    const p = twoBags()
    p.layers.A.items[0].x = 270
    p.layers.A.items[1].x = 2000
    const sets = issueItemSets(validateProject(p), 'A')
    expect([...sets.warnings]).toEqual([1])
    expect([...sets.errors]).toEqual([2])
  })
})

describe('walidacja projektu', () => {
  it('pusta warstwa A', () => {
    const issues = validateProject(createProject())
    expect(issues.some((i) => i.id === 'empty-A' && i.severity === 'error')).toBe(true)
  })

  it('nieciągła i powtórzona kolejność', () => {
    const p = twoBags()
    p.layers.A.items[1].order = 3
    expect(validateOrder(p, 'A')[0].id).toBe('order-gap-A')
    p.layers.A.items[1].order = 1
    expect(validateOrder(p, 'A')[0].id).toBe('order-dup-A-1')
    expect(validateOrder(p, 'A')[0].fix).toBe('renumber')
  })

  it('błędne osie', () => {
    const p = twoBags()
    p.pallet.yDirection = 'lewo'
    expect(validateProject(p).some((i) => i.scope === 'axes')).toBe(true)
  })

  it('brak sygnałów i błędne cykle w trybie podwójnym', () => {
    const p = twoBags()
    p.robot.pickMode = 'podwojny'
    p.robot.assignments = '1=1'
    p.robot.s2On = ''
    const issues = validateProject(p)
    expect(issues.some((i) => i.id === 'signal-2-ON')).toBe(true)
    expect(issues.some((i) => i.scope === 'gripper' && i.fix === 'auto-pair')).toBe(true)
  })

  it('tryb pojedynczy nie wymaga sygnałów sekcji 2 ani cykli', () => {
    const p = twoBags()
    p.robot.s2On = ''
    p.robot.s2Off = ''
    p.robot.assignments = ''
    expect(validateProject(p)).toEqual([])
  })

  it('niespójność A/B po odłączeniu warstwy B', () => {
    const p = twoBags()
    p.layers.B = { name: 'B', items: rotatedLayerB(p), link: null }
    expect(validateProject(p)).toEqual([])
    p.layers.B.items.pop()
    const issues = validateProject(p)
    expect(issues.some((i) => i.id === 'ab-missing-2')).toBe(true)
  })

  it('nazwy programu i punktów', () => {
    const p = twoBags()
    p.robot.programName = '1 program'
    p.robot.baseName = ''
    p.robot.pickup = 'bardzo_dluga_nazwa_punktu'
    const issues = validateProject(p)
    expect(issues.find((i) => i.id === 'name-invalid-program')?.severity).toBe('error')
    expect(issues.find((i) => i.id === 'name-empty-base')?.severity).toBe('error')
    expect(issues.find((i) => i.id === 'name-long-pickup')?.severity).toBe('warning')
  })

  it('problemy powiązanej warstwy B nie są liczone drugi raz', () => {
    const p = createExampleProject()
    const [first, second] = p.layers.A.items
    first.x = second.x
    first.y = second.y
    syncLinkedLayers(p)
    const issues = validateProject(p)
    const overlapsA = issues.filter((i) => i.layer === 'A' && !i.mirrored)
    const overlapsB = issues.filter((i) => i.layer === 'B')
    expect(overlapsA.length).toBeGreaterThan(0)
    expect(overlapsB.length).toBe(overlapsA.length)
    expect(overlapsB.every((i) => i.mirrored)).toBe(true)
    expect(countIssues(issues).errors).toBe(overlapsA.filter((i) => i.severity === 'error').length)
    // Po odłączeniu warstwa B odpowiada za swoje problemy samodzielnie.
    p.layers.B!.link = null
    expect(validateProject(p).some((i) => i.mirrored)).toBe(false)
  })

  it('projekt przykładowy jest poprawny', () => {
    const issues = validateProject(createExampleProject())
    expect(countIssues(issues)).toEqual({ errors: 0, warnings: 0 })
  })
})
