export type Category = 'Makanan' | 'Minuman' | 'Bahan-Baku' | 'Alat-Mandi'
export type Product = {
  id: number; slug: string; name: string; category: Category
  size: string; price: number; img: string; desc: string; best?: boolean
  stock?: number; available?: boolean
}

export const CATEGORIES: Category[] = ['Makanan', 'Minuman', 'Bahan-Baku', 'Alat-Mandi']

export const SHOP = {
  name: 'Warung Gery',
  wa: '6288905601902',
  waLabel: '0889-0560-1902',
  openHour: 6,
  closeHour: 22,
  freeShippingMin: 100000,
  shippingFee: 5000,
}

// kode promo: persen diskon
export const PROMOS: Record<string, number> = { GERY10: 0.1 }

export const products: Product[] = [
  { id: 1, slug: 'beras-5kg', name: 'Beras', category: 'Makanan', size: '5 kg', price: 60000, img: '/images/produk/beras.jpg', desc: 'Beras pulen untuk makan sekeluarga sepanjang minggu.', best: true },
  { id: 2, slug: 'indomie', name: 'Mie Indomie', category: 'Makanan', size: '1 pcs', price: 3500, img: '/images/produk/indomie.jpg', desc: 'Mie instan andalan kapan saja perut keroncongan.', best: true },
  { id: 3, slug: 'telur-1kg', name: 'Telur', category: 'Makanan', size: '1 kg', price: 30000, img: '/images/produk/telur.jpg', desc: 'Telur segar, cocok buat sarapan atau lauk cepat.' },
  { id: 4, slug: 'kopi-kapal-api', name: 'Kopi Kapal Api', category: 'Minuman', size: '1 sachet', price: 3000, img: '/images/produk/kopi.jpg', desc: 'Kopi hitam sachet untuk teman ngobrol pagi dan sore.', best: true },
  { id: 5, slug: 'teh-sariwangi', name: 'Teh Sari Wangi', category: 'Minuman', size: '1 kotak', price: 10000, img: '/images/produk/teh.jpg', desc: 'Teh celup harum, enak panas maupun dingin.' },
  { id: 6, slug: 'susu-ultramilk', name: 'Susu Ultramilk', category: 'Minuman', size: '200 ml', price: 5000, img: '/images/produk/susu.jpg', desc: 'Susu UHT siap minum dalam kemasan praktis.' },
  { id: 7, slug: 'gula-rosebrand', name: 'Gula Pasir Rosebrand', category: 'Bahan-Baku', size: '1 kg', price: 19500, img: '/images/produk/gula.jpg', desc: 'Gula pasir bersih untuk masak dan minuman.' },
  { id: 8, slug: 'shampo-pantene', name: 'Shampo Pantene', category: 'Alat-Mandi', size: '160 ml', price: 18000, img: '/images/produk/shampo.jpg', desc: 'Shampo untuk rambut lembut dan mudah diatur.' },
  { id: 9, slug: 'sabun-dettol', name: 'Sabun Dettol', category: 'Alat-Mandi', size: '100 gr', price: 5000, img: '/images/produk/sabun.jpg', desc: 'Sabun batang antibakteri untuk keluarga.' },
]

export const getProduct = (slug: string) => products.find((p) => p.slug === slug)
