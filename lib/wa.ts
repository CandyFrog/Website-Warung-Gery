import { Order } from './cart'
import { rupiah } from './format'
import { SHOP } from './products'

export function buildMessage(o: Order, shopName = SHOP.name) {
  const items = o.lines
    .map((l, i) => `${i + 1}. ${l.name} (${l.size}) x${l.qty} = ${rupiah(l.price * l.qty)}${l.note ? `\n   Catatan: ${l.note}` : ''}`)
    .join('\n')
  return [
    `Halo ${shopName}, saya mau pesan:`, '',
    items, '',
    `Subtotal : ${rupiah(o.subtotal)}`,
    o.discount ? `Diskon (${o.promo}) : -${rupiah(o.discount)}` : null,
    `Ongkir : ${o.shipping ? rupiah(o.shipping) : 'Gratis'}`,
    `TOTAL : ${rupiah(o.total)}`, '',
    `Nama : ${o.name}`,
    `No. HP : ${o.phone}`,
    `Pengambilan : ${o.mode === 'antar' ? `Diantar ke ${o.address}` : 'Ambil di warung'}`,
    o.note ? `Catatan pesanan : ${o.note}` : null,
    '', `Kode pesanan: ${o.id}`,
  ].filter((x) => x !== null).join('\n')
}

export const waLink = (o: Order, waNumber = SHOP.wa, shopName = SHOP.name) =>
  `https://wa.me/${waNumber}?text=${encodeURIComponent(buildMessage(o, shopName))}`
