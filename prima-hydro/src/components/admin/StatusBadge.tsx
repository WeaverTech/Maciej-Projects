import { ORDER_STATUS_META } from '../../store/orderStore'
import type { OrderStatus } from '../../store/orderStore'

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'border-hazard-500/60 bg-hazard-500/15 text-hazard-400',
  in_progress: 'border-brand-500/60 bg-brand-500/15 text-brand-400',
  ready: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400',
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ORDER_STATUS_META[status].label}
    </span>
  )
}
