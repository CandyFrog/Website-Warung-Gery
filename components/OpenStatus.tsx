'use client'
import { useEffect, useState } from 'react'
import { isShopOpen } from '@/lib/format'
import { useStore } from '@/lib/store'
import { useHydrated } from '@/lib/cart'

export default function OpenStatus() {
  const hydrated = useHydrated()
  const shop = useStore((s) => s.shop)
  const [autoOpen, setAutoOpen] = useState<boolean | null>(null)

  useEffect(() => {
    const check = () => setAutoOpen(isShopOpen(new Date(), shop.openHour, shop.closeHour))
    check()
    const t = setInterval(check, 60000)
    return () => clearInterval(t)
  }, [shop.openHour, shop.closeHour])

  if (!hydrated || autoOpen === null) return null

  const open = shop.manualStatus === 'open' ? true : shop.manualStatus === 'closed' ? false : autoOpen

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
        open ? 'border-brand/40 bg-brand/10 text-brand' : 'border-sale/40 bg-sale/10 text-sale'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${open ? 'bg-brand' : 'bg-sale'}`} />
      </span>
      {shop.manualStatus === 'closed'
        ? 'Tutup Sementara'
        : open
          ? `Buka sampai ${shop.closeHour}:00`
          : `Tutup, buka ${shop.openHour}:00`}
    </span>
  )
}
