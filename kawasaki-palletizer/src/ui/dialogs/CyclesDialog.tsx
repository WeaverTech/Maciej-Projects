import { Check, Info, Wand2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { autoPairCycles, parseCycles, type Cycle, type Section } from '../../core/gripper'
import { sortedByOrder } from '../../core/layers'
import { useStore } from '../../state/store'
import { Button, Callout, cx, Dialog, Segmented } from '../kit'
import { LayerThumb } from '../LayerThumb'

interface Row {
  product: number
  cycle: number
  section: Section
}

function rowsFromCycles(cycles: Cycle[], orders: number[]): Row[] {
  const rows: Row[] = []
  cycles.forEach((cycle, idx) => cycle.forEach((e) => rows.push({ product: e.product, cycle: idx + 1, section: e.section })))
  let next = cycles.length + 1
  for (const order of orders) {
    if (!rows.some((r) => r.product === order)) rows.push({ product: order, cycle: next++, section: 1 })
  }
  return rows.sort((a, b) => a.product - b.product)
}

function rowsToText(rows: Row[]): string {
  const groups = new Map<number, Row[]>()
  for (const row of rows) groups.set(row.cycle, [...(groups.get(row.cycle) ?? []), row])
  return [...groups.keys()]
    .sort((a, b) => a - b)
    .map((key) =>
      groups
        .get(key)!
        .sort((a, b) => a.section - b.section || a.product - b.product)
        .map((r) => `${r.product}=${r.section}`)
        .join(','),
    )
    .join(';')
}

const CYCLE_COLORS = ['#3d5afe', '#e08a00', '#18a058', '#c2255c', '#7c5cf5', '#0b8fa3', '#b4540a', '#566176']

export function CyclesDialog() {
  const project = useStore((s) => s.project)
  const store = useStore.getState()
  const orders = useMemo(() => sortedByOrder(project.layers.A.items).map((i) => i.order), [project.layers.A.items])
  const [rows, setRows] = useState<Row[]>(() => rowsFromCycles(parseCycles(project.robot.assignments, orders).cycles, orders))

  const text = rowsToText(rows)
  const { errors } = parseCycles(text, orders)
  const cycleCount = new Set(rows.map((r) => r.cycle)).size
  const maxCycle = Math.max(orders.length, ...rows.map((r) => r.cycle))
  const patch = (product: number, change: Partial<Row>) => setRows((rs) => rs.map((r) => (r.product === product ? { ...r, ...change } : r)))
  const close = () => store.openDialog(null)

  return (
    <Dialog
      title="Edytor cykli chwytu podwójnego"
      description="Produkty z tym samym numerem cyklu są pobierane jednym dojazdem – każdy inną sekcją chwytaka."
      onClose={close}
      width={820}
      testId="cycles-dialog"
      footer={
        <>
          <span className="mr-auto font-mono text-[11.5px] text-muted" data-testid="cycles-text">
            {text || '—'}
          </span>
          <Button variant="ghost" onClick={close}>
            Anuluj
          </Button>
          <Button
            variant="primary"
            icon={<Check size={15} />}
            disabled={errors.length > 0}
            data-testid="apply-cycles"
            onClick={() => {
              store.setRobot({ assignments: text })
              store.openDialog(null)
              store.toast('Zapisano konfigurację cykli', 'success')
            }}
          >
            Zastosuj
          </Button>
        </>
      }
    >
      {orders.length === 0 ? (
        <div className="p-8 text-center text-[13px] text-muted">Warstwa A nie zawiera produktów – najpierw ułóż warstwę.</div>
      ) : (
        <div className="grid grid-cols-[1fr_300px]">
          <div className="max-h-[52vh] overflow-y-auto p-5">
            <div className="mb-3 flex gap-2">
              <Button size="sm" icon={<Wand2 size={13} />} onClick={() => setRows(rowsFromCycles(autoPairCycles(orders), orders))}>
                Paruj kolejno (1+2, 3+4…)
              </Button>
              <Button size="sm" onClick={() => setRows(orders.map((o, idx) => ({ product: o, cycle: idx + 1, section: 1 as Section })))}>
                Każdy osobno
              </Button>
            </div>
            <table className="w-full border-separate border-spacing-0 text-[13px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold tracking-wide text-subtle uppercase">
                  <th className="border-b border-line py-2 pr-3">Produkt</th>
                  <th className="border-b border-line py-2 pr-3">Cykl pobrania</th>
                  <th className="border-b border-line py-2">Sekcja chwytaka</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.product} data-testid={`cycle-row-${row.product}`}>
                    <td className="border-b border-line py-1.5 pr-3">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <span className="size-2.5 rounded-full" style={{ background: CYCLE_COLORS[(row.cycle - 1) % CYCLE_COLORS.length] }} />
                        Produkt {row.product}
                      </span>
                    </td>
                    <td className="border-b border-line py-1.5 pr-3">
                      <select
                        aria-label={`Cykl produktu ${row.product}`}
                        value={row.cycle}
                        onChange={(e) => patch(row.product, { cycle: Number(e.target.value) })}
                        className="h-8 w-28 cursor-pointer rounded-lg border border-line-strong/70 bg-inset px-2 text-[13px] tabular-nums focus:border-accent focus:outline-none"
                      >
                        {Array.from({ length: maxCycle }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            Cykl {n}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border-b border-line py-1.5">
                      <Segmented
                        size="sm"
                        ariaLabel={`Sekcja produktu ${row.product}`}
                        value={row.section}
                        onChange={(section) => patch(row.product, { section })}
                        options={[
                          { value: 1 as Section, label: 'Sekcja 1' },
                          { value: 2 as Section, label: 'Sekcja 2' },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="flex flex-col gap-3 border-l border-line bg-raised/50 p-5">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase">Podgląd warstwy A</p>
            <div className="rounded-xl border border-line bg-panel p-2">
              <LayerThumb
                pallet={project.pallet}
                product={project.product}
                items={project.layers.A.items}
                width={240}
                height={170}
                colorByOrder={(order) => {
                  const row = rows.find((r) => r.product === order)
                  return row ? CYCLE_COLORS[(row.cycle - 1) % CYCLE_COLORS.length] : undefined
                }}
                labelByOrder={(order) => {
                  const row = rows.find((r) => r.product === order)
                  return row ? `${order}·S${row.section}` : String(order)
                }}
              />
            </div>
            <p className="text-[12px] leading-snug text-muted">Kolor oznacza cykl pobrania, a etykieta numer produktu i sekcję.</p>
            {errors.length > 0 ? (
              <Callout tone="danger" icon={<Info size={15} />}>
                <ul className="flex flex-col gap-0.5" data-testid="cycles-errors">
                  {errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </Callout>
            ) : (
              <Callout tone="success" icon={<Check size={15} />}>
                <span className={cx('font-medium')}>Konfiguracja poprawna</span> – {cycleCount} {cycleCount === 1 ? 'cykl' : 'cykli/cykle'} na warstwę.
              </Callout>
            )}
          </aside>
        </div>
      )}
    </Dialog>
  )
}
