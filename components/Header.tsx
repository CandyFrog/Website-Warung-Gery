'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingBag, ShieldCheck, User, Store } from 'lucide-react'
import { useCart, useHydrated } from '@/lib/cart'
import { useStore } from '@/lib/store'
import OpenStatus from './OpenStatus'
import ThemeToggle from './ThemeToggle'
import RoleModal from './RoleModal'

const baseNav = [
  { href: '/', label: 'Menu' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/riwayat', label: 'Riwayat' },
]

export default function Header() {
  const path = usePathname()
  const hydrated = useHydrated()
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0))
  const pendingOrders = useCart((s) => s.orders.filter((o) => (o.status ?? 'menunggu') === 'menunggu').length)
  const { role, userProfile, shop } = useStore()
  const [modalOpen, setModalOpen] = useState(false)

  const nav = hydrated && role === 'admin' ? [...baseNav, { href: '/admin', label: 'Admin' }] : baseNav

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="group flex items-center gap-2 font-display text-xl font-extrabold text-brand">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-brandink transition-transform group-hover:rotate-6">
              <Store className="h-4 w-4" />
            </span>
            <span>{hydrated ? shop.name : 'Warung Gery'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <OpenStatus />
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all hover:border-brand ${
                hydrated && role === 'admin'
                  ? 'border-brand/50 bg-brand/10 text-brand'
                  : 'border-line bg-card text-ink'
              }`}
              title="Ganti Akun atau Mode Admin"
            >
              {hydrated && role === 'admin' ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {hydrated && userProfile.name ? userProfile.name.split(' ')[0] : 'Akun'}
                  </span>
                </>
              )}
            </button>

            <ThemeToggle />

            <Link href="/keranjang" className="btn btn-brand !py-1.5 !px-3 text-sm">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden xs:inline">Keranjang</span>
              {hydrated && count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="rounded-full bg-tag px-1.5 py-0.5 text-xs font-extrabold leading-none text-tagink"
                >
                  {count}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2.5">
          {nav.map((n) => {
            const active = path === n.href
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative rounded-full px-3.5 py-1 text-sm font-semibold transition-colors ${
                  active ? 'text-brandink' : 'text-mute hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 -z-10 rounded-full bg-brand"
                  />
                )}
                <span className="flex items-center gap-1.5">
                  {n.label}
                  {n.href === '/admin' && hydrated && pendingOrders > 0 && (
                    <span className="rounded-full bg-tag px-1.5 text-[10px] font-extrabold text-tagink">
                      {pendingOrders}
                    </span>
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
      </header>

      <RoleModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
