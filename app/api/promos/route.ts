import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const body = await req.json()
  const code = String(body.code ?? '').trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const { data, error } = await sb
    .from('promos')
    .upsert({
      code,
      discount: Number(body.discount) || 0.1,
      active: body.active ?? true,
      label: body.label || '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promo: data })
}

export async function PATCH(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { code, active } = await req.json()
  const { data, error } = await sb.from('promos').update({ active }).eq('code', code).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promo: data })
}

export async function DELETE(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const { error } = await sb.from('promos').delete().eq('code', code)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
