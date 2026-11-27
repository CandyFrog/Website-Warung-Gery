'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowDown, Sparkles, Tag, Copy, ClipboardList } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useHydrated } from '@/lib/cart'
import { useToast } from '@/lib/toast'
import OpenStatus from './OpenStatus'

export default function HomeHero() {
  const hydrated = useHydrated()
  const { shop, promos } = useStore()
  const showToast = useToast((s) => s.show)

  const showPromos = hydrated && shop.showBannerPromos !== false
  const maxPromos = Math.max(0, shop.maxBannerPromos ?? 2)
  const activePromos = showPromos ? promos.filter((p) => p.active).slice(0, maxPromos) : []

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    showToast(`Kode promo ${code} disalin! Pakai di keranjang.`)
  }

  return (
    <div className="mb-8 space-y-5">
      {hydrated && shop.announcement && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brand/25 bg-brand/10 px-4 py-2.5 text-sm"
        >
          <div className="flex items-center gap-2 font-semibold text-brand">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{shop.announcement}</span>
          </div>
          {activePromos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activePromos.map((pr) => (
                <button
                  key={pr.code}
                  onClick={() => copyCode(pr.code)}
                  className="inline-flex items-center gap-1 rounded-full bg-tag px-2.5 py-0.5 text-xs font-extrabold text-tagink transition-transform hover:scale-105 active:scale-95"
                  title="Klik untuk salin kode promo"
                >
                  <Tag className="h-3 w-3" /> {pr.code} ({Math.round(pr.discount * 100)}%) <Copy className="h-3 w-3 opacity-70" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <section className="grid items-center gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <OpenStatus />
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Belanja harian, tinggal pilih dan{' '}
            <span className="text-brand underline decoration-tag decoration-4 underline-offset-4">kirim.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-mute">
            Beras, telur, kopi, sampai sabun. Isi keranjang, pantau status pesanan secara langsung, dan kirim pesanan lewat WhatsApp warung.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#menu" className="btn btn-brand">
              Lihat menu <ArrowDown className="h-4 w-4" />
            </a>
            <Link href="/riwayat" className="btn btn-line">
              <ClipboardList className="h-4 w-4 text-brand" /> Lacak pesanan
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-3xl border border-line shadow-xl">
            <img
              src="/images/hero.jpg"
              alt="Suasana Warung Gery"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="absolute -bottom-3 left-4 rounded-2xl border border-line bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur-md"
          >
            <p className="text-xs font-bold text-mute">Pengiriman Cepat</p>
            <p className="font-display text-sm font-extrabold text-brand">Ambil di Warung / Antar ke Rumah</p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
