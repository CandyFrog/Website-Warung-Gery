'use client'
import { useEffect, useState } from 'react'

export default function Gallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (open === null) return
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((open + 1) % images.length)
      if (e.key === 'ArrowLeft') setOpen((open - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [open, images.length])
  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((src, i) => (
          <button key={src} onClick={() => setOpen(i)} aria-label={`Buka foto ${i + 1}`}>
            <img src={src} alt={`Foto galeri ${i + 1}`} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={images[open]} alt={`Foto galeri ${open + 1}`} className="max-h-full max-w-full rounded-lg object-contain" />
          <button className="absolute right-4 top-4 btn btn-line" onClick={() => setOpen(null)}>Tutup</button>
          <button className="absolute left-3 btn btn-line" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + images.length) % images.length) }} aria-label="Sebelumnya">‹</button>
          <button className="absolute right-3 btn btn-line" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % images.length) }} aria-label="Berikutnya">›</button>
        </div>
      )}
    </>
  )
}
