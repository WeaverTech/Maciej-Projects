import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HoseConfig, PriceBreakdown } from '../lib/pricing'

export type OrderStatus = 'new' | 'in_progress' | 'ready'

export const ORDER_STATUS_META: Record<OrderStatus, { label: string }> = {
  new: { label: 'Nowe' },
  in_progress: { label: 'W realizacji' },
  ready: { label: 'Gotowe' },
}

export interface Customer {
  firstName: string
  lastName: string
  phone: string
  nip?: string
}

export interface Order {
  id: string
  createdAt: string
  customer: Customer
  config: HoseConfig
  pricing: PriceBreakdown
  status: OrderStatus
}

interface OrderState {
  orders: Order[]
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order
  setStatus: (id: string, status: OrderStatus) => void
  removeOrder: (id: string) => void
}

function generateOrderId(): string {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `PH-${stamp}-${random}`
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (data) => {
        const order: Order = {
          ...data,
          id: generateOrderId(),
          createdAt: new Date().toISOString(),
          status: 'new',
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },

      setStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      removeOrder: (id) =>
        set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),
    }),
    { name: 'prima-hydro-orders' },
  ),
)
