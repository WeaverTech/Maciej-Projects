import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Inbox, ShieldAlert } from 'lucide-react'
import OrderCard from '../components/admin/OrderCard'
import { formatPln } from '../lib/pricing'
import { ORDER_STATUS_META, useOrderStore } from '../store/orderStore'
import type { OrderStatus } from '../store/orderStore'

type Filter = OrderStatus | 'all'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'new', label: ORDER_STATUS_META.new.label },
  { value: 'in_progress', label: ORDER_STATUS_META.in_progress.label },
  { value: 'ready', label: ORDER_STATUS_META.ready.label },
]

export default function AdminPage() {
  const orders = useOrderStore((state) => state.orders)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  )

  const stats = useMemo(
    () => ({
      total: orders.length,
      new: orders.filter((o) => o.status === 'new').length,
      grossSum: orders.reduce((sum, o) => sum + o.pricing.totalGross, 0),
    }),
    [orders],
  )

  return (
    <div className="min-h-screen bg-steel-950">
      {/* Belka panelu */}
      <header className="border-b border-steel-700 bg-steel-900">
        <div className="hazard-stripes h-1.5" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-hazard-500 bg-steel-950">
              <ShieldAlert className="h-5 w-5 text-hazard-400" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-black uppercase tracking-widest text-white">
                Panel zamówień
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-steel-500">
                Prima-Hydro · strefa administratora
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 border border-steel-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-steel-300 transition-colors hover:border-brand-500 hover:text-brand-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć na stronę
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Statystyki */}
        <div className="mb-8 grid grid-cols-1 gap-px border border-steel-800 bg-steel-800 sm:grid-cols-3">
          <div className="bg-steel-900 p-5">
            <span className="block text-xs uppercase tracking-wider text-steel-500">
              Zamówienia łącznie
            </span>
            <span className="font-mono text-3xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="bg-steel-900 p-5">
            <span className="block text-xs uppercase tracking-wider text-steel-500">
              Nowe (do obsłużenia)
            </span>
            <span className="font-mono text-3xl font-bold text-hazard-400">{stats.new}</span>
          </div>
          <div className="bg-steel-900 p-5">
            <span className="block text-xs uppercase tracking-wider text-steel-500">
              Wartość brutto
            </span>
            <span className="font-mono text-3xl font-bold text-brand-400">
              {formatPln(stats.grossSum)}
            </span>
          </div>
        </div>

        {/* Filtry statusów */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                filter === value
                  ? 'border-brand-500 bg-brand-500 text-steel-950'
                  : 'border-steel-700 text-steel-400 hover:border-steel-400 hover:text-steel-200'
              }`}
            >
              {label}
              {value !== 'all' && (
                <span className="ml-2 font-mono">
                  {orders.filter((o) => o.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista zamówień */}
        {filtered.length === 0 ? (
          <div className="border border-dashed border-steel-700 py-20 text-center">
            <Inbox className="mx-auto mb-4 h-12 w-12 text-steel-600" />
            <p className="font-bold uppercase tracking-wide text-steel-400">
              Brak zamówień{filter !== 'all' && ' o tym statusie'}
            </p>
            <p className="mt-2 text-sm text-steel-600">
              Zamówienia z konfiguratora na stronie głównej pojawią się tutaj automatycznie.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
