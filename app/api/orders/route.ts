import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const session = getSession()
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  if (!session || (!session.customerId && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Silakan masuk akun pelanggan terlebih dahulu sebelum checkout.' }, { status: 401 })
  }

  const o = await req.json()
  const { data, error } = await sb
    .from('orders')
    .insert({
      id: o.id,
      date: o.date || new Date().toISOString(),
      customer_id: session?.customerId ?? null,
      name: o.name,
      phone: o.phone,
      mode: o.mode,
      address: o.address || '',
      note: o.note || '',
      promo: o.promo || null,
      lines: o.lines || [],
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      total: o.total,
      status: 'menunggu',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Decrement stock for ordered items
  for (const line of o.lines || []) {
    const { data: prod } = await sb.from('products').select('stock').eq('id', line.id).maybeSingle()
    if (prod) {
      const nextStock = Math.max(0, (prod.stock ?? 0) - Number(line.qty || 1))
      await sb.from('products').update({ stock: nextStock, available: nextStock > 0 }).eq('id', line.id)
    }
  }

  return NextResponse.json({ order: data })
}

export async function PATCH(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

  const { data, error } = await sb.from('orders').update({ status }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order: data })
}
