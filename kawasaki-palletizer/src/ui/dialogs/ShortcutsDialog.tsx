import { useStore } from '../../state/store'
import { Dialog, Kbd } from '../kit'

const GROUPS: { title: string; rows: [string[], string][] }[] = [
  {
    title: 'Edycja układu',
    rows: [
      [['N'], 'Dodaj produkt'],
      [['R'], 'Obróć zaznaczone o 90° (Shift – w drugą stronę)'],
      [['Delete'], 'Usuń zaznaczone (także Backspace)'],
      [['←', '↑', '↓', '→'], 'Przesuń o 1 mm (Shift – o 10 mm)'],
      [['Ctrl', 'D'], 'Duplikuj'],
      [['Ctrl', 'C'], 'Kopiuj'],
      [['Ctrl', 'V'], 'Wklej'],
      [['Ctrl', 'A'], 'Zaznacz wszystko'],
      [['Esc'], 'Anuluj narzędzie / odznacz'],
    ],
  },
  {
    title: 'Narzędzia i widok',
    rows: [
      [['V'], 'Zaznaczanie'],
      [['M'], 'Miarka (P1 → P2, prawy przycisk kasuje)'],
      [['O'], 'Kolejność klikaniem'],
      [['L'], 'Przełącz warstwę A / B'],
      [['G'], 'Siatka'],
      [['S'], 'Przyciąganie'],
      [['F'], 'Dopasuj widok'],
      [['Spacja'], 'Przytrzymaj i przeciągnij, aby przesunąć widok'],
      [['1', '2', '3'], 'Układ 2D / Stos 3D / Kod AS'],
    ],
  },
  {
    title: 'Projekt',
    rows: [
      [['Ctrl', 'Z'], 'Cofnij'],
      [['Ctrl', 'Y'], 'Ponów (także Ctrl+Shift+Z)'],
      [['Ctrl', 'S'], 'Zapisz projekt'],
      [['Ctrl', 'Shift', 'S'], 'Zapisz jako…'],
      [['Ctrl', 'O'], 'Otwórz projekt'],
      [['Ctrl', 'E'], 'Eksportuj kod AS'],
      [['?'], 'Ta lista skrótów'],
    ],
  },
]

export function ShortcutsDialog() {
  return (
    <Dialog title="Skróty klawiszowe" onClose={() => useStore.getState().openDialog(null)} width={860} testId="shortcuts-dialog">
      <div className="grid grid-cols-3 gap-6 p-5">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">{group.title}</h3>
            <ul className="flex flex-col">
              {group.rows.map(([keys, label]) => (
                <li key={label} className="flex items-start justify-between gap-3 border-b border-line py-1.5 last:border-b-0">
                  <span className="text-[12.5px] leading-snug text-fg">{label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  )
}
