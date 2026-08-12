import { Phone, Trash2, User } from 'lucide-react'
import { getDnSize, getHoseType } from '../../data/catalog'
import { formatPln, orientationRelevant } from '../../lib/pricing'
import { ORDER_STATUS_META, useOrderStore } from '../../store/orderStore'
import type { Order, OrderStatus } from '../../store/orderStore'
import StatusBadge from './StatusBadge'

const STATUS_FLOW: OrderStatus[] = ['new', 'in_progress', 'ready']

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-steel-800 bg-steel-950 px-3 py-2">
      <span className="block text-[10px] uppercase tracking-wider text-steel-500">{label}</span>
      <span className="block font-mono text-sm text-steel-200">{value}</span>
    </div>
  )
}

export default function OrderCard({ order }: { order: Order }) {
  const setStatus = useOrderStore((state) => state.setStatus)
  const removeOrder = useOrderStore((state) => state.removeOrder)

  const hose = getHoseType(order.config.hoseType)
  const dn = getDnSize(order.config.dn)
  const created = new Date(order.createdAt)

  const endLabel = (end: Order['config']['endA']) =>
    `${end.family} ${end.angle === 0 ? 'prosta' : `${end.angle}°`}`

  return (
    <article className="border border-steel-700 bg-steel-900">
      {/* Nagłówek karty */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-700 bg-steel-850 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-hazard-400">{order.id}</span>
          <span className="font-mono text-xs text-steel-500">
            {created.toLocaleDateString('pl-PL')}{' '}
            {created.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-[240px_1fr_200px]">
        {/* Dane klienta */}
        <div>
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-steel-500">
            Klient
          </h3>
          <p className="flex items-center gap-2 font-bold text-white">
            <User className="h-4 w-4 text-brand-500" />
            {order.customer.firstName} {order.customer.lastName}
          </p>
          <a
            href={`tel:${order.customer.phone}`}
            className="mt-1.5 flex items-center gap-2 font-mono text-sm text-steel-300 hover:text-brand-400"
          >
            <Phone className="h-4 w-4 text-brand-500" />
            {order.customer.phone}
          </a>
          {order.customer.nip && (
            <p className="mt-1.5 font-mono text-xs text-steel-500">NIP: {order.customer.nip}</p>
          )}
        </div>

        {/* Specyfikacja */}
        <div>
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-steel-500">
            Specyfikacja węża
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SpecItem label="Wąż" value={`${hose.id} (${hose.norm})`} />
            <SpecItem label="Średnica" value={`${dn.id} · ⌀${dn.innerMm.toFixed(1)} mm`} />
            <SpecItem label="Długość" value={`${order.config.lengthMm} mm`} />
            <SpecItem label="Końcówka A" value={endLabel(order.config.endA)} />
            <SpecItem label="Końcówka B" value={endLabel(order.config.endB)} />
            <SpecItem
              label="Kąt / ilość"
              value={`${
                orientationRelevant(order.config) ? `${order.config.orientationDeg}°` : '—'
              } · ${order.config.quantity} szt.`}
            />
          </div>
        </div>

        {/* Wycena */}
        <div className="flex flex-col justify-between border-l-0 lg:border-l lg:border-steel-800 lg:pl-5">
          <div>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-steel-500">
              Wycena
            </h3>
            <div className="space-y-1 font-mono text-sm">
              <div className="flex justify-between text-steel-400">
                <span>Netto</span>
                <span>{formatPln(order.pricing.totalNet)}</span>
              </div>
              <div className="flex justify-between text-steel-400">
                <span>VAT</span>
                <span>{formatPln(order.pricing.vat)}</span>
              </div>
              <div className="flex justify-between border-t border-steel-800 pt-1 text-base font-bold text-brand-400">
                <span>Brutto</span>
                <span>{formatPln(order.pricing.totalGross)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Akcje: zmiana statusu */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-steel-800 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-steel-500">
            Status:
          </span>
          {STATUS_FLOW.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatus(order.id, status)}
              className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                order.status === status
                  ? 'border-brand-500 bg-brand-500 text-steel-950'
                  : 'border-steel-700 text-steel-400 hover:border-steel-400 hover:text-steel-200'
              }`}
            >
              {ORDER_STATUS_META[status].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => removeOrder(order.id)}
          className="flex items-center gap-1.5 border border-steel-800 px-3 py-1.5 text-xs text-steel-500 transition-colors hover:border-red-500 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Usuń
        </button>
      </footer>
    </article>
  )
}
