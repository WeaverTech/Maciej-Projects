import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../src/App'
import { createProject } from '../../src/core/defaults'
import { createExampleProject } from '../../src/core/example'
import { resetStore, useStore } from '../../src/state/store'

const s = () => useStore.getState()

beforeEach(() => {
  localStorage.clear()
  resetStore(createProject())
})

afterEach(cleanup)

function loadExample() {
  act(() => resetStore(createExampleProject()))
}

describe('powłoka aplikacji', () => {
  it('uruchamia się z pustym projektem i podpowiedzią pierwszego kroku', () => {
    render(<App />)
    expect(screen.getByTestId('top-bar')).toBeInTheDocument()
    expect(screen.getByTestId('pallet-canvas')).toBeInTheDocument()
    expect(screen.getByText('Warstwa A jest pusta')).toBeInTheDocument()
    expect(screen.getByTestId('status-count')).toHaveTextContent('0 produktów')
  })

  it('kroki konfiguracji przełączają panele', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('step-product'))
    expect(screen.getByRole('heading', { name: 'Produkt' })).toBeInTheDocument()
    await user.click(screen.getByTestId('step-next'))
    expect(screen.getByRole('heading', { name: 'Warstwy i stos' })).toBeInTheDocument()
    await user.click(screen.getByTestId('step-gripper'))
    expect(screen.getByRole('heading', { name: 'Chwytak' })).toBeInTheDocument()
    await user.click(screen.getByTestId('step-robot'))
    expect(screen.getByRole('heading', { name: 'Program robota' })).toBeInTheDocument()
  })

  it('przyciski paska narzędzi dodają, obracają, duplikują i usuwają', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toolbar = within(screen.getByTestId('canvas-toolbar'))
    await user.click(toolbar.getByRole('button', { name: 'Dodaj produkt' }))
    expect(s().project.layers.A.items).toHaveLength(1)
    await user.click(toolbar.getByRole('button', { name: 'Obróć o 90°' }))
    expect(s().project.layers.A.items[0].rotation).toBe(90)
    await user.click(toolbar.getByRole('button', { name: 'Duplikuj' }))
    expect(s().project.layers.A.items).toHaveLength(2)
    await user.click(toolbar.getByRole('button', { name: 'Usuń' }))
    expect(s().project.layers.A.items).toHaveLength(1)
    expect(screen.getByTestId('status-count')).toHaveTextContent('1 produkt')
  })

  it('narzędzia paska przełączają tryb pracy', async () => {
    const user = userEvent.setup()
    loadExample()
    render(<App />)
    const toolbar = within(screen.getByTestId('canvas-toolbar'))
    await user.click(toolbar.getByRole('button', { name: 'Miarka' }))
    expect(s().tool).toBe('measure')
    await user.click(toolbar.getByRole('button', { name: 'Ustal kolejność klikaniem' }))
    expect(s().tool).toBe('order')
    await user.click(toolbar.getByRole('button', { name: 'Zaznaczanie' }))
    expect(s().tool).toBe('select')
  })
})

describe('skróty klawiszowe', () => {
  it('Delete i Backspace usuwają zaznaczone produkty', () => {
    loadExample()
    render(<App />)
    const [a, b] = s().project.layers.A.items
    act(() => s().select([a.id]))
    fireEvent.keyDown(window, { key: 'Delete' })
    expect(s().project.layers.A.items).toHaveLength(4)
    act(() => s().select([b.id]))
    fireEvent.keyDown(window, { key: 'Backspace' })
    expect(s().project.layers.A.items).toHaveLength(3)
  })

  it('klawisze nie działają na układ podczas pisania w polu', async () => {
    const user = userEvent.setup()
    loadExample()
    render(<App />)
    act(() => s().select([s().project.layers.A.items[0].id]))
    const name = screen.getByTestId('project-name')
    await user.click(name)
    await user.keyboard('{Backspace}r')
    expect(s().project.layers.A.items).toHaveLength(5)
    expect(s().project.layers.A.items[0].rotation).toBe(0)
  })

  it('R obraca, strzałki przesuwają, Ctrl+Z cofa, Esc odznacza', () => {
    loadExample()
    render(<App />)
    const item = s().project.layers.A.items[0]
    act(() => s().select([item.id]))
    fireEvent.keyDown(window, { key: 'r' })
    expect(s().project.layers.A.items[0].rotation).toBe(90)
    fireEvent.keyDown(window, { key: 'ArrowRight', shiftKey: true })
    expect(s().project.layers.A.items[0].x).toBe(item.x + 10)
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(s().project.layers.A.items[0]).toMatchObject({ x: item.x, rotation: 0 })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(s().selection).toEqual([])
  })

  it('M włącza miarkę, a Esc ją wyłącza', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: 'm' })
    expect(s().tool).toBe('measure')
    expect(screen.getByText(/kliknij punkt początkowy P1/)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(s().tool).toBe('select')
  })

  it('? otwiera listę skrótów', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: '?' })
    expect(screen.getByTestId('shortcuts-dialog')).toBeInTheDocument()
  })
})

describe('okna dialogowe', () => {
  it('generator proponuje układy i zastosowanie wypełnia warstwę A', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('open-generator'))
    const dialog = screen.getByTestId('generator-dialog')
    const cards = within(dialog).getAllByTestId('pattern-card')
    expect(cards.length).toBeGreaterThan(1)
    await user.click(cards[0])
    await user.click(within(dialog).getByTestId('apply-pattern'))
    expect(screen.queryByTestId('generator-dialog')).not.toBeInTheDocument()
    expect(s().project.layers.A.items.length).toBeGreaterThan(0)
  })

  it('edytor cykli zapisuje konfigurację i blokuje błędną', async () => {
    const user = userEvent.setup()
    loadExample()
    act(() => s().setRobot({ pickMode: 'podwojny' }))
    act(() => s().setStep('gripper'))
    render(<App />)
    await user.click(screen.getByTestId('open-cycles'))
    const dialog = within(screen.getByTestId('cycles-dialog'))
    expect(dialog.getByTestId('cycles-text')).toHaveTextContent('1=1,2=2;3=1,4=2;5=1')

    // Dwa produkty w tym samym cyklu na tej samej sekcji – błąd.
    await user.click(within(dialog.getByTestId('cycle-row-2')).getByRole('radio', { name: 'Sekcja 1' }))
    expect(dialog.getByTestId('cycles-errors')).toBeInTheDocument()
    expect(dialog.getByTestId('apply-cycles')).toBeDisabled()

    await user.click(dialog.getByRole('button', { name: 'Każdy osobno' }))
    await user.click(dialog.getByTestId('apply-cycles'))
    expect(s().project.robot.assignments).toBe('1=1;2=1;3=1;4=1;5=1')
  })

  it('diagnostyka pokazuje wersję i pusty log', async () => {
    render(<App />)
    act(() => s().openDialog('diagnostics'))
    expect(screen.getByTestId('app-version')).toHaveTextContent('Kawasaki Palletizer 3.0.0')
    expect(screen.getByTestId('log-empty')).toBeInTheDocument()
  })
})

describe('chwytak', () => {
  it('tryb pojedynczy blokuje pola sekcji 2', async () => {
    const user = userEvent.setup()
    loadExample()
    act(() => s().setStep('gripper'))
    render(<App />)
    const section2 = within(screen.getByTestId('signals-2'))
    for (const input of section2.getAllByRole('textbox')) expect(input).toBeDisabled()
    await user.click(screen.getByTestId('mode-double'))
    for (const input of section2.getAllByRole('textbox')) expect(input).toBeEnabled()
    await user.click(screen.getByTestId('mode-single'))
    for (const input of section2.getAllByRole('textbox')) expect(input).toBeDisabled()
  })
})

describe('walidacja', () => {
  it('zakładka Walidacja pokazuje aktualny stan projektu', async () => {
    const user = userEvent.setup()
    loadExample()
    render(<App />)
    await user.click(screen.getByTestId('tab-validation'))
    expect(screen.getByTestId('validation-ok')).toBeInTheDocument()

    // Produkt przesunięty na sąsiada – walidacja odświeża się natychmiast.
    const [first, second] = s().project.layers.A.items
    act(() => s().patchItem(first.id, { x: second.x, y: second.y }))
    expect(screen.queryByTestId('validation-ok')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('issue-list')).getAllByRole('listitem').length).toBeGreaterThan(0)
    expect(screen.getByTestId('status-issues')).toHaveTextContent(/błąd|błędy/)

    act(() => s().undo())
    expect(screen.getByTestId('validation-ok')).toBeInTheDocument()
  })
})

describe('kod AS', () => {
  it('pusty projekt pokazuje listę blokad zamiast kodu', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('view-code'))
    expect(screen.getByTestId('code-blocked')).toHaveTextContent('Warstwa A nie zawiera produktów')
  })

  it('podgląd zawiera kompletny program', async () => {
    const user = userEvent.setup()
    loadExample()
    render(<App />)
    await user.click(screen.getByTestId('view-code'))
    const code = screen.getByTestId('as-code').textContent ?? ''
    expect(code).toContain('.PROGRAM paletyzacja()')
    expect(code).toContain('POINT wa_cel[1] = poczatekpal+TRANS(')
    expect(code).toContain('IF (.j MOD 2)==1 THEN')
    expect(code).toContain('.END')
    expect(screen.getByTestId('code-ok')).toBeInTheDocument()
  })
})
