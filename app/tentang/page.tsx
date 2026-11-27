import type { Metadata } from 'next'
import InstallButton from '@/components/InstallButton'
import { SHOP } from '@/lib/products'
export const metadata: Metadata = { title: 'Tentang' }

const founders = [
  { name: 'Ahmad Syihabullail', ig: 'syihabullail', img: 'founder1.jpg' },
  { name: 'Nahda Pranaja Nadhif', ig: 'nadhz_bae', img: 'founder2.jpg' },
  { name: 'Fauzan Ika', ig: 'zaaan_01', img: 'founder3.png' },
  { name: 'Reva Nagali', ig: 'rreavaa_', img: 'founder4.png' },
  { name: 'Sekarwangi Putri', ig: 'ssekarwangii_', img: 'founder5.png' },
  { name: 'Amanda Salsabila', ig: 'saersabila', img: 'founder6.png' },
]

export default function Tentang() {
  return (
    <div className="space-y-10">
      <section className="grid items-center gap-6 md:grid-cols-2">
        <div className="max-w-prose">
          <h1 className="font-display text-3xl font-extrabold">Warung kecil, untuk kebutuhan sehari-hari warga kampung</h1>
          <p className="mt-3 text-mute leading-relaxed">Warung Gery bukan sekadar tempat belanja, tapi bagian dari keseharian di kampung kami. Kami menyediakan beras, telur, kopi, teh, sampai sabun dan jajanan ringan, supaya tetangga nggak perlu pergi jauh.</p>
          <p className="mt-3 text-mute leading-relaxed">Berdiri dari semangat kebersamaan dan kerja keras. Bagi kami, warung kecil pun bisa berarti besar buat sekitarnya.</p>
        </div>
        <img src="/images/tentang.jpg" alt="Warung Gery" className="aspect-[4/3] w-full rounded-3xl object-cover" />
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl font-bold">Jam buka dan kontak</h2>
        <p>Setiap hari, {SHOP.openHour}:00 sampai {SHOP.closeHour}:00. WhatsApp <a className="font-bold text-brand" href={`https://wa.me/${SHOP.wa}`}>{SHOP.waLabel}</a>.</p>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Tim di balik warung</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {founders.map((f) => (
            <a key={f.ig} href={`https://instagram.com/${f.ig}`} target="_blank" rel="noreferrer" className="text-center">
              <img src={`/images/founder/${f.img}`} alt={f.name} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              <p className="mt-2 text-sm font-bold">{f.name}</p>
              <p className="text-xs text-mute">@{f.ig}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-2 font-display text-xl font-bold">Pasang di HP</h2>
        <InstallButton />
      </section>
    </div>
  )
}
