'use client'
import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OrderStatus = 'menunggu' | 'diproses' | 'siap' | 'selesai' | 'batal'

export type Line = { id: number; qty: number; note: string }
export type Order = {
  id: string; date: string; name: string; phone: string
  mode: 'ambil' | 'antar'; address: string; note: string; promo: string | null
  lines: { id: number; name: string; size: string; qty: number; price: number; note: string }[]
  subtotal: number; discount: number; shipping: number; total: number
  status?: OrderStatus
}

type State = {
  lines: Line[]
  orders: Order[]
  favorites: number[]
  add: (id: number, qty?: number, note?: string) => void
  setQty: (id: number, qty: number) => void
  remove: (id: number) => void
  clear: () => void
  setOrders: (orders: Order[]) => void
  addOrder: (o: Order) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  clearOrders: () => void
  reorder: (o: Order) => void
  toggleFavorite: (id: number) => void
}

export const useCart = create<State>()(
  persist(
    (set) => ({
      lines: [],
      orders: [],
      favorites: [],
      add: (id, qty = 1, note = '') =>
        set((s) => {
          const ex = s.lines.find((l) => l.id === id)
          if (!ex) return { lines: [...s.lines, { id, qty, note }] }
          return { lines: s.lines.map((l) => (l.id === id ? { ...l, qty: l.qty + qty, note: note || l.note } : l)) }
        }),
      setQty: (id, qty) =>
        set((s) => ({ lines: qty <= 0 ? s.lines.filter((l) => l.id !== id) : s.lines.map((l) => (l.id === id ? { ...l, qty } : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      setOrders: (orders) => set({ orders }),
      addOrder: (o) => {
        const orderWithStatus = { ...o, status: o.status ?? ('menunggu' as const) }
        set((s) => ({ orders: [orderWithStatus, ...s.orders].slice(0, 50) }))
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderWithStatus),
        }).catch(() => {})
      },
      updateOrderStatus: (id, status) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }))
        fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status }),
        }).catch(() => {})
      },
      clearOrders: () => set({ orders: [] }),
      reorder: (o) => set({ lines: o.lines.map((l) => ({ id: l.id, qty: l.qty, note: l.note })) }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id],
        })),
    }),
    { name: 'warung-gery-v1' }
  )
)

// localStorage baru kebaca setelah mount, jadi UI tunggu ini dulu biar nggak hydration error
export function useHydrated() {
  const [h, set] = useState(false)
  useEffect(() => set(true), [])
  return h
}
