import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, hashPin, setSessionCookie } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const sb = getSupabaseAdmin()

  if (body.action === 'logout') {
    const res = NextResponse.json({ ok: true })
    clearSessionCookie(res)
    return res
  }

  if (body.action === 'admin_login') {
    const pin = String(body.pin ?? '').trim()
    let expectedPin = process.env.ADMIN_PIN || '1234'

    if (sb) {
      const { data } = await sb.from('shop_settings').select('admin_pin').eq('id', 1).maybeSingle()
      if (data?.admin_pin) expectedPin = data.admin_pin
    }

    if (pin !== expectedPin) {
      return NextResponse.json({ error: 'PIN Admin salah.' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true, role: 'admin' })
    setSessionCookie(res, { role: 'admin' })
    return res
  }

  if (body.action === 'customer_auth') {
    const name = String(body.name ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const address = String(body.address ?? '').trim()
    const pin = String(body.pin ?? '').trim()

    if (!phone || phone.replace(/\D/g, '').length < 9) {
      return NextResponse.json({ error: 'Nomor HP minimal 9 digit.' }, { status: 400 })
    }
    if (pin.length < 4) {
      return NextResponse.json({ error: 'PIN akun minimal 4 karakter.' }, { status: 400 })
    }

    if (!sb) {
      const res = NextResponse.json({
        ok: true,
        session: { role: 'user', name, phone, address },
      })
      setSessionCookie(res, { role: 'user', name, phone, address })
      return res
    }

    const pinHash = hashPin(pin)
    const { data: existing } = await sb.from('customers').select('*').eq('phone', phone).maybeSingle()

    if (existing) {
      if (existing.pin_hash !== pinHash) {
        return NextResponse.json({ error: 'No. HP sudah terdaftar, tapi PIN salah.' }, { status: 401 })
      }
      const nextName = name || existing.name
      const nextAddress = address || existing.address
      if (name || address) {
        await sb.from('customers').update({ name: nextName, address: nextAddress }).eq('id', existing.id)
      }
      const sessionData = {
        role: 'user' as const,
        customerId: existing.id,
        name: nextName,
        phone: existing.phone,
        address: nextAddress,
      }
      const res = NextResponse.json({ ok: true, session: sessionData })
      setSessionCookie(res, sessionData)
      return res
    }

    if (!name) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi untuk daftar baru.' }, { status: 400 })
    }

    const { data: created, error } = await sb
      .from('customers')
      .insert({ name, phone, address, pin_hash: pinHash })
      .select()
      .single()

    if (error || !created) {
      return NextResponse.json({ error: error?.message || 'Gagal mendaftar akun.' }, { status: 500 })
    }

    const sessionData = {
      role: 'user' as const,
      customerId: created.id,
      name: created.name,
      phone: created.phone,
      address: created.address,
    }
    const res = NextResponse.json({ ok: true, session: sessionData })
    setSessionCookie(res, sessionData)
    return res
  }

  return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 })
}
