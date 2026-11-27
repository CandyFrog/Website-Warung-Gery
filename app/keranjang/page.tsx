'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle2, ShoppingBag, LogIn } from 'lucide-react'
import { useCart, useHydrated, Order } from '@/lib/cart'
import { useStore } from '@/lib/store'
import { rupiah } from '@/lib/format'
import { waLink } from '@/lib/wa'
import { useToast } from '@/lib/toast'
import RoleModal from '@/components/RoleModal'

export default function Keranjang() {
  const hydrated = useHydrated()
  const { lines, orders, setQty, remove, clear, addOrder } = useCart()
  const { products, promos, shop, userProfile, updateProduct } = useStore()
  const showToast = useToast((s) => s.show)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'ambil' | 'antar'>('ambil')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code: string; discount: number } | null>(null)
  const [promoMsg, setPromoMsg] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const isLoggedIn = Boolean(userProfile.customerId || userProfile.phone)

  useEffect(() => {
    if (hydrated && isLoggedIn) {
      if (userProfile.name) setName(userProfile.name)
      if (userProfile.phone) setPhone(userProfile.phone)
      if (userProfile.address) setAddress(userProfile.address)
    }
  }, [hydrated, isLoggedIn, userProfile.name, userProfile.phone, userProfile.address])

  if (!hydrated) return null

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto my-8 max-w-md rounded-3xl border border-line bg-card p-8 text-center shadow-lg"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">Pesanan dikirim ke WhatsApp!</h1>
        <p className="mt-2 text-sm text-mute">
          Tunggu konfirmasi dari warung. Kamu juga bisa memantau status pesanan secara langsung di halaman Riwayat.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/riwayat" className="btn btn-brand">Lacak pesanan</Link>
          <Link href="/" className="btn btn-line">Belanja lagi</Link>
        </div>
      </motion.div>
    )
  }

  const items = lines.map((l) => ({ ...l, p: products.find((x) => x.id === l.id)! })).filter((x) => x.p)
  const subtotal = items.reduce((a, x) => a + x.p.price * x.qty, 0)
  const discount = promo ? Math.round(subtotal * promo.discount) : 0
  const shipping = mode === 'antar' && subtotal < shop.freeShippingMin ? shop.shippingFee : 0
  const total = subtotal - discount + shipping

  const activePromos = promos.filter((p) => p.active)

  if (items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">Keranjang masih kosong</h1>
        <p className="mt-2 text-mute">Pilih barang kebutuhanmu dulu dari menu.</p>
        <Link href="/" className="btn btn-brand mt-5">Ke menu</Link>
      </motion.div>
    )
  }

  const applyPromo = (codeOverride?: string) => {
    const code = (codeOverride ?? promoInput).trim().toUpperCase()
    const alreadyUsed = orders.some((o) => o.promo === code && (o.status ?? 'menunggu') !== 'batal')
    if (alreadyUsed) {
      setPromo(null)
      setPromoMsg(`Kode promo ${code} sudah pernah kamu gunakan`)
      return
    }
    const found = activePromos.find((p) => p.code === code)
    if (found) {
      setPromo({ code: found.code, discount: found.discount })
      setPromoInput(found.code)
      setPromoMsg(`Kode ${found.code} dipakai, diskon ${Math.round(found.discount * 100)}%`)
      showToast(`Promo ${found.code} berhasil dipakai!`)
    } else {
      setPromo(null)
      setPromoMsg('Kode promo nggak dikenal atau sudah nonaktif')
    }
  }

  const submit = () => {
    if (!isLoggedIn) {
      showToast('Silakan masuk atau daftar akun dulu untuk checkout', 'info')
      setLoginOpen(true)
      return
    }
    const e: string[] = []
    if (!name.trim()) e.push('Nama belum diisi')
    if (phone.replace(/\D/g, '').length < 9) e.push('Nomor HP minimal 9 digit')
    if (mode === 'antar' && !address.trim()) e.push('Alamat antar belum diisi')
    setErrors(e)
    if (e.length) return

    const order: Order = {
      id: 'WG' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      name: name.trim(),
      phone: phone.trim(),
      mode,
      address: address.trim(),
      note: note.trim(),
      promo: promo?.code ?? null,
      lines: items.map((x) => ({ id: x.p.id, name: x.p.name, size: x.p.size, qty: x.qty, price: x.p.price, note: x.note })),
      subtotal,
      discount,
      shipping,
      total,
      status: 'menunggu',
    }

    // Update stock in store
    items.forEach((x) => {
      const currentStock = x.p.stock ?? 20
      const nextStock = Math.max(0, currentStock - x.qty)
      updateProduct(x.p.id, { stock: nextStock, available: nextStock > 0 })
    })

    addOrder(order)
    window.open(waLink(order, shop.wa, shop.name), '_blank')
    clear()
    setSent(true)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="space-y-3 lg:col-span-3">
        <h1 className="font-display text-2xl font-extrabold">Keranjang Belanja</h1>
        <AnimatePresence mode="popLayout">
          {items.map((x) => (
            <motion.div
              key={x.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="card-surface flex gap-3.5 p-3.5"
            >
              <img src={x.p.img} alt={x.p.name} className="h-20 w-20 rounded-2xl object-cover" />
              <div className="flex-1">
                <p className="font-display font-bold">
                  {x.p.name} <span className="font-sans text-xs font-normal text-mute">({x.p.size})</span>
                </p>
                <p className="text-sm text-mute">
                  {rupiah(x.p.price)}
                  {x.note && ` · ${x.note}`}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button className="btn btn-line !px-2.5 !py-0.5 text-sm" onClick={() => setQty(x.id, x.qty - 1)} aria-label="Kurangi">−</button>
                  <span className="w-6 text-center font-bold">{x.qty}</span>
                  <button className="btn btn-line !px-2.5 !py-0.5 text-sm" onClick={() => setQty(x.id, x.qty + 1)} aria-label="Tambah">+</button>
                  <button className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-sale hover:underline" onClick={() => remove(x.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>
              <p className="font-display font-extrabold">{rupiah(x.p.price * x.qty)}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      <section className="card-surface space-y-3 p-5 lg:col-span-2 lg:self-start">
        <h2 className="font-display text-xl font-extrabold">Data Pemesan</h2>
        <input className="input" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="No. HP / WhatsApp" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          {(['ambil', 'antar'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`btn text-sm ${mode === m ? 'btn-brand' : 'btn-line'}`}>
              {m === 'ambil' ? 'Ambil di warung' : 'Antar ke rumah'}
            </button>
          ))}
        </div>
        {mode === 'antar' && (
          <input className="input" placeholder="Alamat lengkap" value={address} onChange={(e) => setAddress(e.target.value)} />
        )}
        <input className="input" placeholder="Catatan pesanan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="space-y-2">
          <div className="flex gap-2">
            <input className="input uppercase" placeholder="Kode promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
            <button className="btn btn-line" onClick={() => applyPromo()}>Pakai</button>
          </div>
          {promoMsg && <p className={`text-xs font-bold ${promo ? 'text-brand' : 'text-sale'}`}>{promoMsg}</p>}
        </div>

        <dl className="space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd className="font-semibold">{rupiah(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-brand"><dt>Diskon ({promo?.code})</dt><dd className="font-bold">−{rupiah(discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-mute">Ongkir</dt><dd className="font-semibold">{shipping ? rupiah(shipping) : 'Gratis'}</dd></div>
          {mode === 'antar' && shipping > 0 && (
            <p className="text-xs text-mute">Gratis ongkir untuk belanja mulai {rupiah(shop.freeShippingMin)}.</p>
          )}
          <div className="flex justify-between border-t border-line pt-2 text-lg font-extrabold">
            <dt>Total</dt>
            <dd className="text-brand">{rupiah(total)}</dd>
          </div>
        </dl>

        {errors.length > 0 && (
          <ul className="list-disc pl-5 text-xs font-bold text-sale">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
        {!isLoggedIn && (
          <div className="rounded-2xl border border-tag/40 bg-tag/15 p-3 text-xs font-semibold text-tagink dark:text-tag">
            Kamu belum masuk akun. Silakan masuk atau daftar dulu supaya pesananmu tersimpan di riwayat.
          </div>
        )}
        <button className="btn btn-brand w-full" onClick={submit}>
          {!isLoggedIn ? (
            <>
              <LogIn className="h-4 w-4" /> Masuk / Daftar untuk Checkout
            </>
          ) : (
            'Pesan lewat WhatsApp'
          )}
        </button>
      </section>
      <RoleModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
