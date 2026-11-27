import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProduct, products } from '@/lib/products'
import { rupiah } from '@/lib/format'
import AddToCart from '@/components/AddToCart'
import ProductCard from '@/components/ProductCard'

export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }))
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug)
  return { title: p ? p.name : 'Produk' }
}

export default function Detail({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug)
  if (!p) notFound()
  const related = products.filter((x) => x.category === p.category && x.id !== p.id)
  return (
    <>
      <Link href="/" className="text-sm font-bold text-brand">← Kembali ke menu</Link>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <img src={p.img} alt={p.name} className="aspect-square w-full rounded-3xl object-cover" />
        <div>
          <p className="text-sm text-mute">{p.category} · {p.size}</p>
          <h1 className="font-display text-3xl font-extrabold">{p.name}</h1>
          <span className="price-tag mt-3 text-xl">{rupiah(p.price)}</span>
          <p className="mt-4 text-mute">{p.desc}</p>
          <AddToCart id={p.id} />
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-bold">Barang lain di {p.category}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </>
  )
}
