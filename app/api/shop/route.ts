import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const body = await req.json()
  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.wa !== undefined) patch.wa = body.wa
  if (body.waLabel !== undefined) patch.wa_label = body.waLabel
  if (body.openHour !== undefined) patch.open_hour = Number(body.openHour)
  if (body.closeHour !== undefined) patch.close_hour = Number(body.closeHour)
  if (body.freeShippingMin !== undefined) patch.free_shipping_min = Number(body.freeShippingMin)
  if (body.shippingFee !== undefined) patch.shipping_fee = Number(body.shippingFee)
  if (body.announcement !== undefined) patch.announcement = body.announcement
  if (body.manualStatus !== undefined) patch.manual_status = body.manualStatus
  if (body.adminPin !== undefined && String(body.adminPin).trim().length >= 4) {
    patch.admin_pin = String(body.adminPin).trim()
  }

  const { error } = await sb.from('shop_settings').update(patch).eq('id', 1)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
