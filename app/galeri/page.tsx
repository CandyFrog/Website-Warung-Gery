import type { Metadata } from 'next'
import Gallery from '@/components/Gallery'
export const metadata: Metadata = { title: 'Galeri' }

const images = Array.from({ length: 15 }, (_, i) => `/images/galeri/g${i + 1}.jpg`)

export default function Galeri() {
  return (
    <>
      <h1 className="mb-4 font-display text-3xl font-extrabold">Galeri Warung Gery</h1>
      <Gallery images={images} />
    </>
  )
}
