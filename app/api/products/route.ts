import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const body = await req.json()
  const { data, error } = await sb
    .from('products')
    .insert({
      slug: body.slug,
      name: body.name,
      category: body.category,
      size: body.size ?? '1 pcs',
      price: Number(body.price) || 0,
      img: body.img || '/images/produk/beras.jpg',
      desc: body.desc || '',
      best: Boolean(body.best),
      stock: Number(body.stock) ?? 20,
      available: body.available ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

export async function PATCH(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const body = await req.json()
  const { id, ...patch } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await sb.from('products').update(patch).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

export async function DELETE(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await sb.from('products').delete().eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
