'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Package, ClipboardList, Tag, Settings, Plus, Trash2, Edit3,
  CheckCircle2, Clock, Truck, XCircle, LogOut, RotateCcw, KeyRound, MessageCircle, Search
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { useCart, useHydrated, OrderStatus } from '@/lib/cart'
import { CATEGORIES, Category, Product } from '@/lib/products'
import { rupiah } from '@/lib/format'
import { useToast } from '@/lib/toast'

type Tab = 'orders' | 'products' | 'promos' | 'settings'

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  menunggu: { label: 'Menunggu', color: 'bg-tag/20 text-tagink dark:text-tag border-tag/40' },
  diproses: { label: 'Disiapkan', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  siap: { label: 'Siap / Diantar', color: 'bg-brand/15 text-brand border-brand/40' },
  selesai: { label: 'Selesai', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' },
  batal: { label: 'Dibatalkan', color: 'bg-sale/15 text-sale border-sale/40' },
}

const IMAGE_PRESETS = [
  '/images/produk/beras.jpg',
  '/images/produk/indomie.jpg',
  '/images/produk/telur.jpg',
  '/images/produk/kopi.jpg',
  '/images/produk/teh.jpg',
  '/images/produk/susu.jpg',
  '/images/produk/gula.jpg',
  '/images/produk/shampo.jpg',
  '/images/produk/sabun.jpg',
]

export default function AdminPage() {
  const hydrated = useHydrated()
  const {
    role, cloudEnabled, loginAdmin, logout, setAdminPin,
    products, addProduct, updateProduct, deleteProduct, resetProducts,
    promos, upsertPromo, togglePromo, deletePromo,
    shop, updateShop,
  } = useStore()
  const { orders, updateOrderStatus } = useCart()
  const showToast = useToast((s) => s.show)

  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [tab, setTab] = useState<Tab>('orders')
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'semua'>('semua')
  const [prodQuery, setProdQuery] = useState('')

  // Product modal state
  const [prodModal, setProdModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [pName, setPName] = useState('')
  const [pCat, setPCat] = useState<Category>('Makanan')
  const [pSize, setPSize] = useState('1 pcs')
  const [pPrice, setPPrice] = useState('5000')
  const [pStock, setPStock] = useState('20')
  const [pImg, setPImg] = useState(IMAGE_PRESETS[0])
  const [pDesc, setPDesc] = useState('')
  const [pBest, setPBest] = useState(false)

  // Promo form state
  const [promoCode, setPromoCode] = useState('')
  const [promoPct, setPromoPct] = useState('10')
  const [promoLabel, setPromoLabel] = useState('')

  // Settings local state
  const [newPin, setNewPin] = useState('')

  if (!hydrated) return null

  if (role !== 'admin') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto my-12 max-w-md rounded-3xl border border-line bg-card p-7 shadow-lg"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-center font-display text-2xl font-extrabold">Akses Admin Warung</h1>
        <p className="mt-1 text-center text-sm text-mute">
          Masukkan PIN Admin untuk mengelola pesanan, stok produk, dan promo.
        </p>
        <div className="mt-4 rounded-2xl border border-line bg-bg/60 p-3 text-center text-xs text-mute">
          PIN Demo default: <span className="font-bold text-ink">1234</span>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const res = await loginAdmin(pinInput)
            if (res.ok) {
              showToast('Selamat datang, Admin Warung!')
              setPinInput('')
              setPinError('')
            } else {
              setPinError(res.error || 'PIN tidak sesuai.')
            }
          }}
          className="mt-4 space-y-3"
        >
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            <input
              type="password"
              inputMode="numeric"
              className="input !pl-9"
              placeholder="Masukkan PIN Admin"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value)
                setPinError('')
              }}
              autoFocus
            />
          </div>
          {pinError && <p className="text-xs font-bold text-sale">{pinError}</p>}
          <button type="submit" className="btn btn-brand w-full">Masuk Dashboard</button>
        </form>
      </motion.div>
    )
  }

  const revenue = orders
    .filter((o) => (o.status ?? 'menunggu') !== 'batal')
    .reduce((sum, o) => sum + o.total, 0)
  const activeOrdersCount = orders.filter((o) => ['menunggu', 'diproses', 'siap'].includes(o.status ?? 'menunggu')).length
  const lowStockCount = products.filter((p) => !p.available || (p.stock ?? 0) <= 5).length
  const activePromosCount = promos.filter((p) => p.active).length

  const filteredOrders = orders.filter((o) => orderFilter === 'semua' || (o.status ?? 'menunggu') === orderFilter)
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(prodQuery.toLowerCase().trim()))

  const openAddModal = () => {
    setEditingId(null)
    setPName('')
    setPCat('Makanan')
    setPSize('1 pcs')
    setPPrice('5000')
    setPStock('20')
    setPImg(IMAGE_PRESETS[0])
    setPDesc('')
    setPBest(false)
    setProdModal(true)
  }

  const openEditModal = (p: Product) => {
    setEditingId(p.id)
    setPName(p.name)
    setPCat(p.category)
    setPSize(p.size)
    setPPrice(String(p.price))
    setPStock(String(p.stock ?? 20))
    setPImg(p.img)
    setPDesc(p.desc)
    setPBest(Boolean(p.best))
    setProdModal(true)
  }

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pName.trim()) return showToast('Nama produk wajib diisi', 'error')
    const priceNum = Math.max(0, Number(pPrice) || 0)
    const stockNum = Math.max(0, Number(pStock) || 0)
    const slug = pName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).slice(-4)

    if (editingId !== null) {
      updateProduct(editingId, {
        name: pName.trim(),
        category: pCat,
        size: pSize.trim() || '1 pcs',
        price: priceNum,
        stock: stockNum,
        available: stockNum > 0,
        img: pImg.trim() || IMAGE_PRESETS[0],
        desc: pDesc.trim() || 'Produk pilihan Warung Gery.',
        best: pBest,
      })
      showToast('Produk diperbarui!')
    } else {
      addProduct({
        slug,
        name: pName.trim(),
        category: pCat,
        size: pSize.trim() || '1 pcs',
        price: priceNum,
        stock: stockNum,
        available: stockNum > 0,
        img: pImg.trim() || IMAGE_PRESETS[0],
        desc: pDesc.trim() || 'Produk pilihan Warung Gery.',
        best: pBest,
      })
      showToast('Produk baru ditambahkan!')
    }
    setProdModal(false)
  }

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault()
    const code = promoCode.trim().toUpperCase()
    const pct = Math.min(90, Math.max(1, Number(promoPct) || 10))
    if (!code) return showToast('Kode promo wajib diisi', 'error')
    upsertPromo({
      code,
      discount: pct / 100,
      active: true,
      label: promoLabel.trim() || `Diskon ${pct}% semua belanja`,
    })
    setPromoCode('')
    setPromoLabel('')
    showToast(`Promo ${code} disimpan!`)
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-card p-5 shadow-sm"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-extrabold text-brand">
              <ShieldCheck className="h-3.5 w-3.5" /> Mode Admin
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cloudEnabled ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-tag/20 text-tagink dark:text-tag'}`}>
              {cloudEnabled ? '● Supabase Cloud Aktif' : '○ Mode Lokal'}
            </span>
            <h1 className="font-display text-2xl font-extrabold">Dashboard Warung Gery</h1>
          </div>
          <p className="mt-1 text-sm text-mute">Kelola pesanan masuk, stok barang, kode promo, dan jam operasional.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={shop.manualStatus}
            onChange={(e) => {
              const val = e.target.value as 'auto' | 'open' | 'closed'
              updateShop({ manualStatus: val })
              showToast(`Status warung: ${val === 'auto' ? 'Otomatis' : val === 'open' ? 'Buka' : 'Tutup'}`)
            }}
            className="input !w-auto text-sm font-bold"
            aria-label="Status operasional warung"
          >
            <option value="auto">Status: Otomatis ({shop.openHour}:00–{shop.closeHour}:00)</option>
            <option value="open">Status: Paksa Buka</option>
            <option value="closed">Status: Tutup Sementara</option>
          </select>

          <button
            onClick={async () => {
              await logout()
              showToast('Keluar dari mode Admin', 'info')
            }}
            className="btn btn-line text-sm text-sale"
          >
            <LogOut className="h-4 w-4" /> Keluar Admin
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total Pendapatan', value: rupiah(revenue), sub: `${orders.length} total transaksi`, accent: 'text-brand' },
          { label: 'Pesanan Aktif', value: `${activeOrdersCount}`, sub: 'Perlu diproses / diantar', accent: 'text-tagink dark:text-tag' },
          { label: 'Produk & Stok', value: `${products.length} item`, sub: lowStockCount ? `${lowStockCount} stok menipis/habis` : 'Semua stok aman', accent: lowStockCount ? 'text-sale' : 'text-brand' },
          { label: 'Promo Aktif', value: `${activePromosCount} kode`, sub: 'Tampil di halaman depan', accent: 'text-brand' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-surface p-4"
          >
            <p className="text-xs font-bold text-mute">{kpi.label}</p>
            <p className={`mt-1 font-display text-2xl font-extrabold ${kpi.accent}`}>{kpi.value}</p>
            <p className="mt-0.5 text-xs text-mute">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { id: 'orders', label: 'Pesanan', icon: ClipboardList, badge: activeOrdersCount },
          { id: 'products', label: 'Produk & Stok', icon: Package },
          { id: 'promos', label: 'Kode Promo', icon: Tag },
          { id: 'settings', label: 'Pengaturan', icon: Settings },
        ] as const).map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-bold transition-colors ${
                active ? 'border-brand text-brandink' : 'border-line bg-card text-mute hover:text-ink'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-tab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 -z-10 rounded-2xl bg-brand"
                />
              )}
              <Icon className="h-4 w-4" />
              {t.label}
              {'badge' in t && t.badge ? (
                <span className="rounded-full bg-tag px-1.5 text-[11px] font-extrabold text-tagink">{t.badge}</span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tab === 'orders' && (
          <motion.section
            key="orders"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              {(['semua', 'menunggu', 'diproses', 'siap', 'selesai', 'batal'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold capitalize transition-colors ${
                    orderFilter === st ? 'border-brand bg-brand text-brandink' : 'border-line bg-card text-mute hover:text-ink'
                  }`}
                >
                  {st === 'semua' ? 'Semua' : STATUS_META[st].label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line p-10 text-center text-mute">
                Belum ada pesanan di kategori ini. Pesanan yang dibuat pelanggan di keranjang akan otomatis muncul di sini.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((o) => {
                  const status: OrderStatus = o.status ?? 'menunggu'
                  const meta = STATUS_META[status]
                  const cleanPhone = o.phone.replace(/\D/g, '').replace(/^0/, '62')
                  return (
                    <div key={o.id} className="card-surface p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-base font-extrabold">{o.id}</span>
                            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.color}`}>
                              {meta.label}
                            </span>
                            <span className="text-xs text-mute">
                              {new Date(o.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-bold">
                            {o.name} · <span className="font-normal text-mute">{o.phone}</span>
                          </p>
                          <p className="text-xs text-mute">
                            {o.mode === 'antar' ? `Diantar ke: ${o.address}` : 'Ambil sendiri di warung'}
                            {o.note ? ` · Catatan: "${o.note}"` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg font-extrabold text-brand">{rupiah(o.total)}</p>
                          {o.promo && <p className="text-xs font-bold text-tagink dark:text-tag">Promo: {o.promo}</p>}
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-bg/70 p-2.5 text-xs">
                        {o.lines.map((l) => (
                          <div key={l.id} className="flex justify-between py-0.5">
                            <span>
                              {l.name} ({l.size}) <strong className="text-brand">x{l.qty}</strong>
                              {l.note && <span className="text-mute"> — {l.note}</span>}
                            </span>
                            <span className="font-semibold">{rupiah(l.price * l.qty)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {([
                            { s: 'menunggu', label: 'Menunggu', icon: Clock },
                            { s: 'diproses', label: 'Siapkan', icon: Package },
                            { s: 'siap', label: 'Siap/Antar', icon: Truck },
                            { s: 'selesai', label: 'Selesai', icon: CheckCircle2 },
                            { s: 'batal', label: 'Batal', icon: XCircle },
                          ] as const).map((btn) => {
                            const Icon = btn.icon
                            const active = status === btn.s
                            return (
                              <button
                                key={btn.s}
                                onClick={() => {
                                  updateOrderStatus(o.id, btn.s)
                                  showToast(`Pesanan ${o.id} diubah ke ${STATUS_META[btn.s].label}`)
                                }}
                                className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all ${
                                  active
                                    ? 'border-brand bg-brand text-brandink'
                                    : 'border-line bg-card text-mute hover:border-brand hover:text-ink'
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" /> {btn.label}
                              </button>
                            )
                          })}
                        </div>
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${o.name}, update pesanan ${o.id} dari ${shop.name}: status saat ini "${STATUS_META[status].label}".`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-line !py-1 !px-3 text-xs"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-brand" /> Chat Pembeli
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.section>
        )}

        {tab === 'products' && (
          <motion.section
            key="products"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <input
                  className="input !pl-9"
                  placeholder="Cari produk untuk edit atau ubah stok..."
                  value={prodQuery}
                  onChange={(e) => setProdQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (confirm('Reset semua produk ke daftar awal?')) {
                      resetProducts()
                      showToast('Daftar produk di-reset ke awal', 'info')
                    }
                  }}
                  className="btn btn-line text-sm"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
                <button onClick={openAddModal} className="btn btn-brand text-sm">
                  <Plus className="h-4 w-4" /> Tambah Produk
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {filteredProducts.map((p) => {
                const stock = p.stock ?? 20
                const avail = p.available !== false && stock > 0
                return (
                  <div key={p.id} className="card-surface flex gap-3 p-3">
                    <img src={p.img} alt={p.name} className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display font-bold leading-tight">{p.name}</p>
                          <p className="text-xs text-mute">{p.category} · {p.size} · <strong className="text-ink">{rupiah(p.price)}</strong></p>
                        </div>
                        <button
                          onClick={() => {
                            updateProduct(p.id, { available: !avail })
                            showToast(`${p.name} ditandai ${!avail ? 'Tersedia' : 'Habis'}`)
                          }}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            avail ? 'bg-brand/15 text-brand' : 'bg-sale/15 text-sale'
                          }`}
                        >
                          {avail ? 'Tersedia' : 'Habis'}
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-mute">Stok:</span>
                          <button
                            onClick={() => updateProduct(p.id, { stock: Math.max(0, stock - 1), available: stock - 1 > 0 })}
                            className="btn btn-line !px-2 !py-0.5 text-xs"
                          >
                            −
                          </button>
                          <span className="w-7 text-center font-bold">{stock}</span>
                          <button
                            onClick={() => updateProduct(p.id, { stock: stock + 1, available: true })}
                            className="btn btn-line !px-2 !py-0.5 text-xs"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateProduct(p.id, { best: !p.best })}
                            className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${
                              p.best ? 'border-tag bg-tag/20 text-tagink dark:text-tag' : 'border-line text-mute'
                            }`}
                          >
                            Terlaris
                          </button>
                          <button onClick={() => openEditModal(p)} className="rounded-lg border border-line p-1.5 text-mute hover:text-brand" aria-label="Edit">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus ${p.name}?`)) {
                                deleteProduct(p.id)
                                showToast(`${p.name} dihapus`, 'info')
                              }
                            }}
                            className="rounded-lg border border-line p-1.5 text-mute hover:text-sale"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.section>
        )}

        {tab === 'promos' && (
          <motion.section
            key="promos"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-6 md:grid-cols-5"
          >
            <form onSubmit={handleAddPromo} className="card-surface space-y-3 p-5 md:col-span-2 md:self-start">
              <h2 className="font-display text-lg font-extrabold">Buat Kode Promo</h2>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Kode Promo</label>
                <input className="input uppercase" placeholder="Misal: HEMAT20" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Diskon (%)</label>
                <input type="number" min={1} max={90} className="input" value={promoPct} onChange={(e) => setPromoPct(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Keterangan (opsional)</label>
                <input className="input" placeholder="Misal: Diskon akhir pekan" value={promoLabel} onChange={(e) => setPromoLabel(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-brand w-full">
                <Plus className="h-4 w-4" /> Simpan Promo
              </button>
            </form>

            <div className="space-y-3 md:col-span-3">
              {promos.map((pr) => (
                <div key={pr.code} className="card-surface flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-tag px-2.5 py-0.5 font-display text-sm font-extrabold text-tagink">
                        {pr.code}
                      </span>
                      <span className="font-bold text-brand">Diskon {Math.round(pr.discount * 100)}%</span>
                    </div>
                    <p className="mt-1 text-xs text-mute">{pr.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePromo(pr.code)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        pr.active ? 'bg-brand/15 text-brand' : 'bg-line/60 text-mute'
                      }`}
                    >
                      {pr.active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      onClick={() => {
                        deletePromo(pr.code)
                        showToast(`Promo ${pr.code} dihapus`, 'info')
                      }}
                      className="rounded-lg border border-line p-1.5 text-mute hover:text-sale"
                      aria-label="Hapus promo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {tab === 'settings' && (
          <motion.section
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-surface max-w-2xl space-y-4 p-5"
          >
            <h2 className="font-display text-lg font-extrabold">Pengaturan Warung</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Nama Warung</label>
                <input className="input" value={shop.name} onChange={(e) => updateShop({ name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">No. WhatsApp (format 628...)</label>
                <input className="input" value={shop.wa} onChange={(e) => updateShop({ wa: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Jam Buka (WIB)</label>
                <input type="number" min={0} max={23} className="input" value={shop.openHour} onChange={(e) => updateShop({ openHour: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Jam Tutup (WIB)</label>
                <input type="number" min={1} max={24} className="input" value={shop.closeHour} onChange={(e) => updateShop({ closeHour: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Min. Belanja Gratis Ongkir (Rp)</label>
                <input type="number" className="input" value={shop.freeShippingMin} onChange={(e) => updateShop({ freeShippingMin: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Ongkos Kirim (Rp)</label>
                <input type="number" className="input" value={shop.shippingFee} onChange={(e) => updateShop({ shippingFee: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-mute">Banner Pengumuman (tampil di halaman utama)</label>
              <input className="input" value={shop.announcement} onChange={(e) => updateShop({ announcement: e.target.value })} />
            </div>
            <div className="border-t border-line pt-4">
              <label className="mb-1 block text-xs font-bold text-mute">Ubah PIN Admin</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  className="input max-w-xs"
                  placeholder="PIN baru..."
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPin.trim().length < 4) return showToast('PIN minimal 4 karakter', 'error')
                    setAdminPin(newPin)
                    setNewPin('')
                    showToast('PIN Admin berhasil diubah!')
                  }}
                  className="btn btn-brand"
                >
                  Simpan PIN
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {prodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setProdModal(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={saveProduct}
              className="w-full max-w-lg space-y-3 rounded-3xl border border-line bg-card p-6 shadow-2xl"
            >
              <h2 className="font-display text-xl font-extrabold">
                {editingId !== null ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-mute">Nama Produk</label>
                  <input className="input" value={pName} onChange={(e) => setPName(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-mute">Kategori</label>
                  <select className="input" value={pCat} onChange={(e) => setPCat(e.target.value as Category)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-mute">Ukuran / Kemasan</label>
                  <input className="input" value={pSize} onChange={(e) => setPSize(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-mute">Harga (Rp)</label>
                  <input type="number" className="input" value={pPrice} onChange={(e) => setPPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-mute">Stok</label>
                  <input type="number" className="input" value={pStock} onChange={(e) => setPStock(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-mute">Gambar Produk</label>
                  <select className="input" value={pImg} onChange={(e) => setPImg(e.target.value)}>
                    {IMAGE_PRESETS.map((img) => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-mute">Deskripsi</label>
                <textarea className="input min-h-[70px]" value={pDesc} onChange={(e) => setPDesc(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={pBest} onChange={(e) => setPBest(e.target.checked)} className="h-4 w-4 accent-brand" />
                Tandai sebagai Produk Terlaris
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setProdModal(false)} className="btn btn-line">Batal</button>
                <button type="submit" className="btn btn-brand">Simpan Produk</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
