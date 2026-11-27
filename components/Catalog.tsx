'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Heart } from 'lucide-react'
import { CATEGORIES, products as initialProducts } from '@/lib/products'
import { useStore } from '@/lib/store'
import { useCart, useHydrated } from '@/lib/cart'
import ProductCard from './ProductCard'

const sorts = { populer: 'Urutan awal', murah: 'Termurah', mahal: 'Termahal', nama: 'Nama A-Z' } as const
type Sort = keyof typeof sorts

export default function Catalog() {
  const hydrated = useHydrated()
  const storeProducts = useStore((s) => s.products)
  const favorites = useCart((s) => s.favorites)

  const products = hydrated ? storeProducts : initialProducts

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('Semua')
  const [sort, setSort] = useState<Sort>('populer')

  const list = useMemo(() => {
    let r = products.filter((p) => {
      const matchCat =
        cat === 'Semua' ||
        (cat === 'Favorit' ? favorites.includes(p.id) : p.category === cat)
      const matchQ = p.name.toLowerCase().includes(q.toLowerCase().trim())
      return matchCat && matchQ
    })
    if (sort === 'murah') r = [...r].sort((a, b) => a.price - b.price)
    if (sort === 'mahal') r = [...r].sort((a, b) => b.price - a.price)
    if (sort === 'nama') r = [...r].sort((a, b) => a.name.localeCompare(b.name))
    return r
  }, [products, favorites, q, cat, sort])

  const tabs = ['Semua', 'Favorit', ...CATEGORIES]

  return (
    <section id="menu" className="scroll-mt-28">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input
            className="input !pl-10"
            placeholder="Cari barang, misal: kopi, beras, telur..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cari barang"
          />
        </div>
        <select
          className="input sm:w-48 font-semibold"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Urutkan"
        >
          {Object.entries(sorts).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((c) => {
          const active = cat === c
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${
                active ? 'border-brand text-brandink' : 'border-line bg-card text-mute hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="cat-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 -z-10 rounded-full bg-brand"
                />
              )}
              {c === 'Favorit' && <Heart className="h-3.5 w-3.5" />}
              {c}
              {c === 'Favorit' && hydrated && favorites.length > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-tag text-tagink' : 'bg-line text-ink'}`}>
                  {favorites.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-dashed border-line p-10 text-center text-mute"
        >
          {cat === 'Favorit'
            ? 'Belum ada produk favorit. Tekan ikon hati di kartu produk untuk menyimpan.'
            : `Barang "${q}" nggak ketemu. Coba kata lain atau pilih kategori Semua.`}
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
