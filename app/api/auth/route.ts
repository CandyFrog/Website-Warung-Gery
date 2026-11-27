import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, getSession, hashPin, setSessionCookie } from '@/lib/auth'
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

  if (body.action === 'customer_login') {
    const identifier = String(body.identifier ?? '').trim().toLowerCase()
    const pin = String(body.pin ?? '').trim()

    if (!identifier) return NextResponse.json({ error: 'Masukkan ID / Username atau No. HP.' }, { status: 400 })
    if (pin.length < 4) return NextResponse.json({ error: 'PIN minimal 4 karakter.' }, { status: 400 })
    if (!sb) return NextResponse.json({ error: 'Database belum terhubung.' }, { status: 503 })

    const pinHash = hashPin(pin)
    const { data: byUsername } = await sb.from('customers').select('*').eq('username', identifier).maybeSingle()
    const user = byUsername || (await sb.from('customers').select('*').eq('phone', identifier).maybeSingle()).data

    if (!user) return NextResponse.json({ error: 'Akun tidak ditemukan. Silakan daftar dulu.' }, { status: 404 })
    if (user.pin_hash !== pinHash) return NextResponse.json({ error: 'PIN salah.' }, { status: 401 })

    const sessionData = {
      role: 'user' as const,
      customerId: user.id,
      username: user.username || undefined,
      name: user.name,
      phone: user.phone,
      address: user.address,
    }
    const res = NextResponse.json({ ok: true, session: sessionData })
    setSessionCookie(res, sessionData)
    return res
  }

  if (body.action === 'customer_register') {
    const username = String(body.username ?? '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
    const name = String(body.name ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const address = String(body.address ?? '').trim()
    const pin = String(body.pin ?? '').trim()

    if (username.length < 3) return NextResponse.json({ error: 'ID / Username minimal 3 huruf/angka.' }, { status: 400 })
    if (!name) return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 })
    if (phone.replace(/\D/g, '').length < 9) return NextResponse.json({ error: 'Nomor HP minimal 9 digit.' }, { status: 400 })
    if (pin.length < 4) return NextResponse.json({ error: 'PIN minimal 4 karakter.' }, { status: 400 })

    if (!sb) {
      const sessionData = { role: 'user' as const, username, name, phone, address }
      const res = NextResponse.json({ ok: true, session: sessionData })
      setSessionCookie(res, sessionData)
      return res
    }

    const { data: dupUser } = await sb.from('customers').select('id').eq('username', username).maybeSingle()
    if (dupUser) return NextResponse.json({ error: 'ID / Username sudah dipakai orang lain.' }, { status: 409 })

    const { data: dupPhone } = await sb.from('customers').select('id').eq('phone', phone).maybeSingle()
    if (dupPhone) return NextResponse.json({ error: 'No. HP sudah terdaftar. Silakan langsung Login.' }, { status: 409 })

    const { data: created, error } = await sb
      .from('customers')
      .insert({ username, name, phone, address, pin_hash: hashPin(pin) })
      .select()
      .single()

    if (error || !created) {
      return NextResponse.json({ error: error?.message || 'Gagal mendaftar akun.' }, { status: 500 })
    }

    const sessionData = {
      role: 'user' as const,
      customerId: created.id,
      username: created.username,
      name: created.name,
      phone: created.phone,
      address: created.address,
    }
    const res = NextResponse.json({ ok: true, session: sessionData })
    setSessionCookie(res, sessionData)
    return res
  }

  if (body.action === 'customer_update') {
    const session = getSession()
    if (!session || session.role !== 'user' || !session.customerId) {
      return NextResponse.json({ error: 'Belum login.' }, { status: 401 })
    }

    const name = String(body.name ?? '').trim()
    const address = String(body.address ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Nama lengkap tidak boleh kosong.' }, { status: 400 })

    if (sb) {
      const { error } = await sb
        .from('customers')
        .update({ name, address })
        .eq('id', session.customerId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const sessionData = {
      role: 'user' as const,
      customerId: session.customerId,
      username: session.username,
      name,
      phone: session.phone,
      address,
    }
    const res = NextResponse.json({ ok: true, session: sessionData })
    setSessionCookie(res, sessionData)
    return res
  }

  return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 })
}
