'use client'
import { create } from 'zustand'

export type ToastItem = {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
}

type ToastState = {
  toasts: ToastItem[]
  show: (message: string, type?: ToastItem['type']) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2, 9)
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 2800)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
