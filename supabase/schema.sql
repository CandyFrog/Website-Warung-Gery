-- Jalankan script ini di Supabase Dashboard -> SQL Editor -> New Query

-- 1. Tabel Produk
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '1 pcs',
  price INTEGER NOT NULL DEFAULT 0,
  img TEXT NOT NULL DEFAULT '/images/produk/beras.jpg',
  "desc" TEXT NOT NULL DEFAULT '',
  best BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 25,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Promo
CREATE TABLE IF NOT EXISTS promos (
  code TEXT PRIMARY KEY,
  discount NUMERIC(4,2) NOT NULL DEFAULT 0.10,
  active BOOLEAN NOT NULL DEFAULT true,
  label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Pengaturan Warung (1 baris)
CREATE TABLE IF NOT EXISTS shop_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Warung Gery',
  wa TEXT NOT NULL DEFAULT '6288905601902',
  wa_label TEXT NOT NULL DEFAULT '0889-0560-1902',
  open_hour INTEGER NOT NULL DEFAULT 6,
  close_hour INTEGER NOT NULL DEFAULT 22,
  free_shipping_min INTEGER NOT NULL DEFAULT 100000,
  shipping_fee INTEGER NOT NULL DEFAULT 5000,
  announcement TEXT NOT NULL DEFAULT 'Gratis ongkir belanja mulai Rp100.000! Pakai kode GERY10 untuk diskon 10%.',
  manual_status TEXT NOT NULL DEFAULT 'auto',
  admin_pin TEXT NOT NULL DEFAULT '1234'
);

-- 4. Tabel Pelanggan (untuk profil & sesi per user)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel Pesanan
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'ambil',
  address TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  promo TEXT,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'menunggu'
);

-- Seed Data Awal
INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO promos (code, discount, active, label)
VALUES ('GERY10', 0.10, true, 'Diskon 10% semua belanja')
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (slug, name, category, size, price, img, "desc", best, stock, available) VALUES
  ('beras-5kg', 'Beras', 'Makanan', '5 kg', 60000, '/images/produk/beras.jpg', 'Beras pulen untuk makan sekeluarga sepanjang minggu.', true, 25, true),
  ('indomie', 'Mie Indomie', 'Makanan', '1 pcs', 3500, '/images/produk/indomie.jpg', 'Mie instan andalan kapan saja perut keroncongan.', true, 40, true),
  ('telur-1kg', 'Telur', 'Makanan', '1 kg', 30000, '/images/produk/telur.jpg', 'Telur segar, cocok buat sarapan atau lauk cepat.', false, 20, true),
  ('kopi-kapal-api', 'Kopi Kapal Api', 'Minuman', '1 sachet', 3000, '/images/produk/kopi.jpg', 'Kopi hitam sachet untuk teman ngobrol pagi dan sore.', true, 50, true),
  ('teh-sariwangi', 'Teh Sari Wangi', 'Minuman', '1 kotak', 10000, '/images/produk/teh.jpg', 'Teh celup harum, enak panas maupun dingin.', false, 20, true),
  ('susu-ultramilk', 'Susu Ultramilk', 'Minuman', '200 ml', 5000, '/images/produk/susu.jpg', 'Susu UHT siap minum dalam kemasan praktis.', false, 30, true),
  ('gula-rosebrand', 'Gula Pasir Rosebrand', 'Bahan-Baku', '1 kg', 19500, '/images/produk/gula.jpg', 'Gula pasir bersih untuk masak dan minuman.', false, 20, true),
  ('shampo-pantene', 'Shampo Pantene', 'Alat-Mandi', '160 ml', 18000, '/images/produk/shampo.jpg', 'Shampo untuk rambut lembut dan mudah diatur.', false, 15, true),
  ('sabun-dettol', 'Sabun Dettol', 'Alat-Mandi', '100 gr', 5000, '/images/produk/sabun.jpg', 'Sabun batang antibakteri untuk keluarga.', false, 25, true)
ON CONFLICT (slug) DO NOTHING;
