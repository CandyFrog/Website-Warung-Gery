'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Plus, Flame } from 'lucide-react'
import { Product } from '@/lib/products'
import { rupiah } from '@/lib/format'
import { useCart, useHydrated } from '@/lib/cart'
import { useToast } from '@/lib/toast'

export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const hydrated = useHydrated()
  const { add, favorites, toggleFavorite } = useCart()
  const showToast = useToast((s) => s.show)

  const isFav = hydrated && favorites.includes(p.id)
  const stock = p.stock ?? 20
  const available = p.available !== false && stock > 0

  const handleAdd = () => {
    if (!available) return
    add(p.id)
    showToast(`${p.name} masuk keranjang`)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.25) }}
      whileHover={{ y: -4 }}
      className={`card-surface group flex flex-col overflow-hidden ${!available ? 'opacity-75' : ''}`}
    >
      <div className="relative overflow-hidden">
        <Link href={`/produk/${p.slug}`} className="block">
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {p.best && available && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-sale px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            <Flame className="h-3 w-3" /> Terlaris
          </span>
        )}

        {!available ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-extrabold tracking-wide text-white backdrop-blur-[1px]">
            STOK HABIS
          </span>
        ) : stock <= 5 ? (
          <span className="absolute left-2.5 bottom-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
            Sisa {stock}
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => {
            toggleFavorite(p.id)
            showToast(isFav ? `${p.name} dihapus dari favorit` : `${p.name} disimpan ke favorit`, 'info')
          }}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-card/85 backdrop-blur-sm transition-transform active:scale-90 ${
            isFav ? 'text-sale' : 'text-mute hover:text-sale'
          }`}
          aria-label={isFav ? `Hapus ${p.name} dari favorit` : `Simpan ${p.name} ke favorit`}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <Link href={`/produk/${p.slug}`} className="font-display font-bold leading-tight transition-colors group-hover:text-brand">
          {p.name}
        </Link>
        <p className="text-xs text-mute">{p.category} · {p.size}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="price-tag text-sm">{rupiah(p.price)}</span>
          <button
            onClick={handleAdd}
            disabled={!available}
            className={`btn !px-3 !py-1.5 text-xs ${
              available ? 'btn-brand' : 'cursor-not-allowed border border-line bg-bg text-mute shadow-none'
            }`}
            aria-label={`Tambah ${p.name} ke keranjang`}
          >
            <Plus className="h-3.5 w-3.5" />
            {available ? 'Tambah' : 'Habis'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
