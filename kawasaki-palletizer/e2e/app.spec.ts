import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const items = (page: Page) => page.locator('[data-testid=pallet-canvas] [data-item-id]')
const item = (page: Page, order: number) => page.locator(`[data-testid=pallet-canvas] [data-order="${order}"]`)

async function centerOf(page: Page, order: number) {
  const box = await item(page, order).locator('rect').last().boundingBox()
  if (!box) throw new Error(`Brak produktu ${order}`)
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, width: box.width, height: box.height }
}

async function loadExample(page: Page) {
  await page.getByRole('button', { name: 'Wczytaj przykład' }).click()
  await expect(items(page)).toHaveCount(5)
}

test.beforeEach(async ({ page }) => {
  // Bez natywnych okien wyboru pliku: zapis = pobranie, odczyt = <input type="file">.
  await page.addInitScript(() => {
    Object.assign(window, { showSaveFilePicker: undefined, showOpenFilePicker: undefined })
  })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.goto('/')
  await expect(page.getByTestId('app')).toBeVisible()
  ;(page as Page & { errors?: string[] }).errors = errors
})

test.afterEach(async ({ page }) => {
  expect((page as Page & { errors?: string[] }).errors ?? []).toEqual([])
})

test('start: pusty projekt z podpowiedzią i poprawnym tytułem', async ({ page }) => {
  await expect(page).toHaveTitle(/Kawasaki Palletizer/)
  await expect(page.getByText('Warstwa A jest pusta')).toBeVisible()
  await expect(page.getByTestId('status-count')).toHaveText('0 produktów')
  await expect(page.getByTestId('status-issues')).toContainText('błąd')
})

test('generator otwiera się w dużym oknie i wypełnia warstwę', async ({ page }) => {
  await page.getByTestId('open-generator').click()
  const dialog = page.getByTestId('generator-dialog')
  await expect(dialog).toBeVisible()
  const box = await dialog.boundingBox()
  expect(box!.width).toBeGreaterThan(850)

  await expect(dialog.getByTestId('pattern-card').first()).toContainText('szt.')
  await dialog.getByTestId('pattern-card').first().click()
  await dialog.getByTestId('apply-pattern').click()
  await expect(dialog).toBeHidden()
  expect(await items(page).count()).toBeGreaterThan(3)
  await expect(page.getByTestId('status-issues')).toHaveText('Projekt poprawny')
})

test('dodaj / obróć / przesuń / usuń myszą i klawiaturą', async ({ page }) => {
  await page.getByTestId('canvas-toolbar').getByRole('button', { name: 'Dodaj produkt' }).click()
  await expect(items(page)).toHaveCount(1)
  await page.getByTestId('tab-selection').click()
  await expect(page.getByTestId('selected-title')).toHaveText('Produkt 1')

  // Obrót: przycisk, klawisz R i dwuklik.
  await page.getByTestId('canvas-toolbar').getByRole('button', { name: 'Obróć o 90°' }).click()
  await expect(page.getByTestId('rotation-90')).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('r')
  await expect(page.getByTestId('rotation-180')).toHaveAttribute('aria-checked', 'true')
  const c = await centerOf(page, 1)
  await page.mouse.dblclick(c.x, c.y)
  await expect(page.getByTestId('rotation-270')).toHaveAttribute('aria-checked', 'true')

  // Przeciągnięcie przesuwa produkt, a Ctrl+Z cofa cały gest jednym krokiem.
  const before = await page.getByTestId('base-coords').innerText()
  const start = await centerOf(page, 1)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + 80, start.y + 40, { steps: 6 })
  await page.mouse.move(start.x + 160, start.y + 90, { steps: 6 })
  await page.mouse.up()
  const after = await page.getByTestId('base-coords').innerText()
  expect(after).not.toBe(before)
  await page.keyboard.press('Control+z')
  await expect(page.getByTestId('base-coords')).toHaveText(before.replace(/\s+/g, ' '), { useInnerText: true })
  await page.keyboard.press('Control+y')

  // Strzałki przesuwają o 1 mm / 10 mm.
  const xField = page.getByTestId('right-panel').getByRole('textbox').first()
  const x0 = Number((await xField.inputValue()).replace(',', '.'))
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Shift+ArrowRight')
  await expect(xField).toHaveValue(String(x0 + 11).replace('.', ','))

  // Delete i Backspace.
  await page.keyboard.press('Control+d')
  await expect(items(page)).toHaveCount(2)
  await page.keyboard.press('Delete')
  await expect(items(page)).toHaveCount(1)
  const last = await centerOf(page, 1)
  await page.mouse.click(last.x, last.y)
  await page.keyboard.press('Backspace')
  await expect(items(page)).toHaveCount(0)
})

test('przeciąganie przyciąga do krawędzi sąsiada', async ({ page }) => {
  await loadExample(page)
  const second = await centerOf(page, 2)
  // Odsuwamy produkt 2 poza paletę, a potem wracamy „mniej więcej” na miejsce – ma trafić dokładnie.
  await page.mouse.move(second.x, second.y)
  await page.mouse.down()
  await page.mouse.move(second.x + 200, second.y - 150, { steps: 8 })
  await page.mouse.up()
  await expect(page.getByTestId('status-issues')).not.toHaveText('Projekt poprawny')

  const moved = await centerOf(page, 2)
  await page.mouse.move(moved.x, moved.y)
  await page.mouse.down()
  await page.mouse.move(second.x + 5, second.y + 4, { steps: 10 })
  await page.mouse.up()
  await page.getByTestId('tab-selection').click()
  const fields = page.getByTestId('right-panel').getByRole('textbox')
  await expect(fields.nth(0)).toHaveValue('900')
  await expect(fields.nth(1)).toHaveValue('200')
  await expect(page.getByTestId('status-issues')).toHaveText('Projekt poprawny')
})

test('zaznaczanie ramką i Ctrl+A', async ({ page }) => {
  await loadExample(page)
  const canvas = (await page.getByTestId('pallet-canvas').boundingBox())!
  const a = await centerOf(page, 1)
  const b = await centerOf(page, 2)
  await page.mouse.move(canvas.x + 12, canvas.y + 12)
  await page.mouse.down()
  await page.mouse.move(b.x + 20, b.y + 10, { steps: 6 })
  await page.mouse.up()
  await expect(page.getByTestId('status-selection')).toHaveText('zaznaczono: 2')
  await page.keyboard.press('Control+a')
  await expect(page.getByTestId('status-selection')).toHaveText('zaznaczono: 5')
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('status-selection')).toBeHidden()
  await page.mouse.click(a.x, a.y)
  await expect(page.getByTestId('status-selection')).toHaveText('zaznaczono: 1')
})

test('miarka: P1, P2, prawy przycisk kasuje, Esc kończy', async ({ page }) => {
  await loadExample(page)
  const first = await centerOf(page, 1)
  await page.keyboard.press('m')
  await expect(page.getByText('kliknij punkt początkowy P1')).toBeVisible()
  // Narożniki produktu 1 (600 × 400 mm) – przyciąganie miarki daje dokładny wynik.
  await page.mouse.click(first.x - first.width / 2 + 3, first.y - first.height / 2 + 3)
  await expect(page.getByText('kliknij punkt końcowy P2')).toBeVisible()
  await page.mouse.click(first.x + first.width / 2 - 3, first.y - first.height / 2 + 3)
  await expect(page.getByTestId('status-measure')).toContainText('600 mm')

  await page.mouse.click(first.x, first.y, { button: 'right' })
  await expect(page.getByTestId('status-measure')).toBeHidden()
  await expect(page.getByText('kliknij punkt początkowy P1')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByText('kliknij punkt początkowy P1')).toBeHidden()
  await expect(items(page)).toHaveCount(5)
})

test('kolejność klikaniem zmienia numerację', async ({ page }) => {
  await loadExample(page)
  const centers = [] as { x: number; y: number }[]
  for (let order = 1; order <= 5; order++) centers.push(await centerOf(page, order))
  await page.keyboard.press('o')
  for (const c of [...centers].reverse()) await page.mouse.click(c.x, c.y)
  // Po ostatnim kliknięciu narzędzie wraca do zaznaczania, a numeracja jest odwrócona.
  await expect(page.getByText('Klikaj produkty w kolejności układania')).toBeHidden()
  const now = await centerOf(page, 5)
  expect(Math.abs(now.x - centers[0].x)).toBeLessThan(2)
  expect(Math.abs(now.y - centers[0].y)).toBeLessThan(2)
})

test('warstwa B: powiązana z A, a po odłączeniu edytowalna', async ({ page }) => {
  await page.getByTestId('open-generator').click()
  await page.getByTestId('apply-pattern').click()
  const count = await items(page).count()
  await page.getByTestId('add-layer-b').click()
  await expect(page.getByTestId('layer-tab-B')).toHaveAttribute('aria-selected', 'true')
  await expect(items(page)).toHaveCount(count)
  await expect(page.getByText('obrót A o 180°')).toBeVisible()
  await expect(page.getByTestId('canvas-toolbar').getByRole('button', { name: 'Dodaj produkt' })).toBeDisabled()

  await page.getByRole('button', { name: 'Edytuj niezależnie' }).click()
  await page.getByTestId('canvas-toolbar').getByRole('button', { name: 'Dodaj produkt' }).click()
  await expect(items(page)).toHaveCount(count + 1)
  await page.getByTestId('layer-tab-A').click()
  await expect(items(page)).toHaveCount(count)
})

test('chwyt pojedynczy blokuje sekcję 2, podwójny otwiera edytor cykli', async ({ page }) => {
  await loadExample(page)
  await page.getByTestId('step-gripper').click()
  const section2 = page.getByTestId('signals-2').getByRole('textbox')
  await expect(section2.first()).toBeDisabled()
  await page.getByTestId('mode-double').click()
  await expect(section2.first()).toBeEnabled()
  await expect(page.getByTestId('cycle-summary')).toContainText('Cykl 3')

  await page.getByTestId('open-cycles').click()
  const dialog = page.getByTestId('cycles-dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByTestId('cycles-text')).toHaveText('1=1,2=2;3=1,4=2;5=1')
  await dialog.getByTestId('cycle-row-5').getByRole('radio', { name: 'Sekcja 2' }).click()
  await dialog.getByTestId('apply-cycles').click()
  await expect(dialog).toBeHidden()

  await page.getByTestId('view-code').click()
  await expect(page.getByTestId('as-code')).toContainText('SIGNAL 10,-11')
})

test('walidacja odświeża się i prowadzi do problemu', async ({ page }) => {
  await loadExample(page)
  await page.getByTestId('tab-validation').click()
  await expect(page.getByTestId('validation-ok')).toBeVisible()

  await page.getByTestId('step-pallet').click()
  // Zmniejszenie palety powoduje wystawanie ponad limit worka.
  const length = page.getByTestId('step-panel').getByRole('textbox').first()
  await length.fill('1000')
  await length.press('Enter')
  await expect(page.getByTestId('validation-ok')).toBeHidden()
  await expect(page.getByTestId('issue-list').getByRole('listitem').first()).toBeVisible()
  await expect(page.getByTestId('status-issues')).toContainText(/błąd|błędy|błędów/)

  await page.keyboard.press('Escape')
  await page.getByTestId('undo').click()
  await expect(page.getByTestId('validation-ok')).toBeVisible()
})

test('podgląd AS, kopiowanie i zapis pliku .as', async ({ page }) => {
  await loadExample(page)
  await page.getByTestId('view-code').click()
  const code = page.getByTestId('as-code')
  await expect(code).toContainText('.PROGRAM paletyzacja()')
  await expect(code).toContainText('POINT wb_cel[5]')
  await expect(page.getByTestId('code-ok')).toBeVisible()

  await page.getByTestId('copy-as').click()
  await expect(page.getByTestId('toasts')).toContainText('Skopiowano kod AS')
  const clipboard = await page.evaluate(() => navigator.clipboard.readText())
  expect(clipboard.startsWith('.PROGRAM paletyzacja()')).toBe(true)
  expect(clipboard.trimEnd().endsWith('.END')).toBe(true)

  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('save-as').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('paletyzacja.as')
  const saved = await readFile(await download.path(), 'utf8')
  expect(saved).toBe(clipboard)
})

test('zapis i odczyt projektu', async ({ page }) => {
  await loadExample(page)
  await page.getByTestId('project-name').fill('Test zapisu')
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('save-project').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('Test_zapisu.json')
  const path = await download.path()
  const json = JSON.parse(await readFile(path, 'utf8'))
  expect(json.version).toBe(4)
  expect(json.layers.A.items).toHaveLength(5)
  await expect(page.getByTestId('save-state')).toContainText('Test_zapisu.json')

  // Nowy projekt, a potem odczyt zapisanego pliku.
  await page.getByRole('button', { name: 'Menu Plik' }).click()
  await page.getByRole('menuitem', { name: 'Nowy projekt' }).click()
  await expect(items(page)).toHaveCount(0)

  const chooserPromise = page.waitForEvent('filechooser')
  await page.keyboard.press('Control+o')
  const chooser = await chooserPromise
  await chooser.setFiles(path)
  await expect(items(page)).toHaveCount(5)
  await expect(page.getByTestId('project-name')).toHaveValue('Test zapisu')
  await expect(page.getByTestId('layer-tab-B')).toBeVisible()
})

test('autozapis przywraca projekt po odświeżeniu strony', async ({ page }) => {
  await loadExample(page)
  await page.getByTestId('project-name').fill('Autozapis')
  await page.waitForTimeout(700)
  await page.reload()
  await expect(items(page)).toHaveCount(5)
  await expect(page.getByTestId('project-name')).toHaveValue('Autozapis')
})

test('podgląd 3D renderuje stos i animację układania', async ({ page }) => {
  await loadExample(page)
  await page.getByTestId('view-stack').click()
  await expect(page.getByTestId('stack-canvas')).toBeVisible()
  await expect(page.getByTestId('stack-stats')).toContainText('40 produktów')
  await expect(page.getByTestId('stack-progress')).toContainText('40 / 40 szt.')
  await page.getByTestId('stack-slider').fill('12')
  await expect(page.getByTestId('stack-progress')).toContainText('12 / 40 szt.')
  await expect(page.getByTestId('stack-progress')).toContainText('warstwa 3 z 8')
  await page.getByTestId('stack-play').click()
  await expect(page.getByTestId('stack-progress')).not.toContainText('12 / 40 szt.')
})

test('motyw ciemny i lista skrótów', async ({ page }) => {
  const html = page.locator('html')
  await page.getByTestId('theme-toggle').click()
  await page.getByTestId('theme-toggle').click()
  await expect(html).toHaveClass(/dark/)
  await page.reload()
  await expect(html).toHaveClass(/dark/)

  await page.keyboard.press('?')
  await expect(page.getByTestId('shortcuts-dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('shortcuts-dialog')).toBeHidden()
})
