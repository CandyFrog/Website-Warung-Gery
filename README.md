# Warung Gery (Next.js)

Jalankan:
```
npm install
npm run dev      # buka http://localhost:3000
npm run build && npm start
```

Yang perlu lu ganti sendiri:
- `lib/products.ts`: data produk, nomor WA, jam buka, ongkir, kode promo (GERY10).
- `public/images/produk/`: foto produk masih pakai foto lama yang belum cocok (beras pakai foto coklat, dst). Ganti dengan nama file yang sama.
- `public/icon-192.png` dan `icon-512.png`: ikon PWA, idealnya ukuran asli 192x192 dan 512x512.
- Video lama (65 MB) sengaja nggak dibawa. Kompres dulu baru dipasang kalau mau.

Deploy: push ke GitHub lalu import di vercel.com.
