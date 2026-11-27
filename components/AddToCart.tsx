'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Check } from 'lucide-react'
import { useCart, useHydrated } from '@/lib/cart'
import { useStore } from '@/lib/store'
import { useToast } from '@/lib/toast'

export default function AddToCart({ id }: { id: number }) {
  const hydrated = useHydrated()
  const add = useCart((s) => s.add)
  const product = useStore((s) => s.products.find((p) => p.id === id))
  const showToast = useToast((s) => s.show)

  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)

  const stock = hydrated && product ? (product.stock ?? 20) : 20
  const available = hydrated && product ? product.available !== false && stock > 0 : true

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-3">
        <button className="btn btn-line !px-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Kurangi">−</button>
        <span className="w-8 text-center text-lg font-bold">{qty}</span>
        <button className="btn btn-line !px-3" onClick={() => setQty(qty + 1)} aria-label="Tambah">+</button>
        {hydrated && (
          <span className={`ml-auto text-xs font-bold ${available ? 'text-brand' : 'text-sale'}`}>
            {available ? `Stok tersedia: ${stock}` : 'Stok habis'}
          </span>
        )}
      </div>
      <input
        className="input"
        placeholder="Catatan, misal: yang kemasan baru"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={!available}
      />
      <button
        disabled={!available}
        className={`btn w-full ${available ? 'btn-brand' : 'cursor-not-allowed border border-line bg-bg text-mute shadow-none'}`}
        onClick={() => {
          if (!available) return
          add(id, qty, note.trim())
          setDone(true)
          showToast('Ditambahkan ke keranjang!')
        }}
      >
        <ShoppingBag className="h-4 w-4" />
        {available ? 'Masukkan ke keranjang' : 'Stok sedang habis'}
      </button>
      {done && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-brand">
          <Check className="h-4 w-4" /> Sudah masuk keranjang.{' '}
          <Link href="/keranjang" className="underline">Buka keranjang</Link>
        </p>
      )}
    </div>
  )
}
