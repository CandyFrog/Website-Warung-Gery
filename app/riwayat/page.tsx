'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Package, Truck, CheckCircle2, XCircle, RefreshCw, MessageCircle } from 'lucide-react'
import { useCart, useHydrated, OrderStatus } from '@/lib/cart'
import { useStore } from '@/lib/store'
import { rupiah } from '@/lib/format'
import { waLink } from '@/lib/wa'

const STEPS: { key: OrderStatus; label: string; icon: typeof Clock }[] = [
  { key: 'menunggu', label: 'Menunggu', icon: Clock },
  { key: 'diproses', label: 'Disiapkan', icon: Package },
  { key: 'siap', label: 'Siap / Diantar', icon: Truck },
  { key: 'selesai', label: 'Selesai', icon: CheckCircle2 },
]

export default function Riwayat() {
  const hydrated = useHydrated()
  const router = useRouter()
  const { orders, reorder, clearOrders } = useCart()
  const shop = useStore((s) => s.shop)
  const [filter, setFilter] = useState<'semua' | 'aktif' | 'selesai'>('semua')

  if (!hydrated) return null

  if (!orders.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">Belum ada riwayat pesanan</h1>
        <p className="mt-2 text-mute">Pesanan yang sudah kamu kirim akan muncul di sini beserta status prosesnya.</p>
        <Link href="/" className="btn btn-brand mt-5">Mulai belanja</Link>
      </motion.div>
    )
  }

  const list = orders.filter((o) => {
    const st = o.status ?? 'menunggu'
    if (filter === 'aktif') return ['menunggu', 'diproses', 'siap'].includes(st)
    if (filter === 'selesai') return ['selesai', 'batal'].includes(st)
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Riwayat & Lacak Pesanan</h1>
          <p className="text-xs text-mute">Status pesanan otomatis ter-update saat diproses oleh Admin warung.</p>
        </div>
        <button className="text-sm font-bold text-sale hover:underline" onClick={() => confirm('Hapus semua riwayat?') && clearOrders()}>
          Hapus semua
        </button>
      </div>

      <div className="flex gap-2">
        {([
          { id: 'semua', label: 'Semua' },
          { id: 'aktif', label: 'Sedang Berjalan' },
          { id: 'selesai', label: 'Selesai / Batal' },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3.5 py-1 text-xs font-bold transition-colors ${
              filter === f.id ? 'border-brand bg-brand text-brandink' : 'border-line bg-card text-mute hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((o, idx) => {
          const status: OrderStatus = o.status ?? 'menunggu'
          const stepIndex = STEPS.findIndex((s) => s.key === status)

          return (
            <motion.article
              key={o.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="card-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-extrabold">{o.id}</p>
                  <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-semibold text-mute">
                    {o.mode === 'antar' ? 'Diantar' : 'Ambil di warung'}
                  </span>
                </div>
                <p className="text-xs text-mute">
                  {new Date(o.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              {/* Order Status Stepper */}
              {status === 'batal' ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-sale/30 bg-sale/10 px-3 py-2 text-xs font-bold text-sale">
                  <XCircle className="h-4 w-4" /> Pesanan Dibatalkan
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  {STEPS.map((st, i) => {
                    const Icon = st.icon
                    const reached = i <= stepIndex
                    const current = i === stepIndex
                    return (
                      <div key={st.key} className="flex flex-col items-center text-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                            current
                              ? 'border-brand bg-brand text-brandink shadow-md scale-105'
                              : reached
                                ? 'border-brand/40 bg-brand/15 text-brand'
                                : 'border-line bg-bg text-mute'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`mt-1 text-[11px] font-bold ${reached ? 'text-ink' : 'text-mute'}`}>
                          {st.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              <p className="mt-3 text-sm text-mute">{o.lines.map((l) => `${l.name} x${l.qty}`).join(', ')}</p>
              <p className="mt-1 font-display text-lg font-extrabold text-brand">{rupiah(o.total)}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="btn btn-brand !py-1.5 text-xs"
                  onClick={() => {
                    reorder(o)
                    router.push('/keranjang')
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Pesan lagi
                </button>
                <a className="btn btn-line !py-1.5 text-xs" href={waLink(o, shop.wa, shop.name)} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-3.5 w-3.5 text-brand" /> Kirim ulang ke WA
                </a>
              </div>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
