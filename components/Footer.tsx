import { SHOP } from '@/lib/products'
export default function Footer() {
  return (
    <footer className="border-t border-line py-6 text-center text-sm text-mute">
      <p>Belanja harian? Ke Warung Gery, pasti nyaman dan lengkap.</p>
      <p className="mt-1">Buka setiap hari {SHOP.openHour}:00 sampai {SHOP.closeHour}:00 · WhatsApp <a className="font-bold text-brand" href={`https://wa.me/${SHOP.wa}`}>{SHOP.waLabel}</a></p>
      <p className="mt-1">© 2026 Warung Gery</p>
    </footer>
  )
}
