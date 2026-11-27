import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = getSession()
  const sb = getSupabaseAdmin()

  if (!sb) {
    return NextResponse.json({ configured: false, session })
  }

  const [{ data: products }, { data: promos }, { data: shopRow }] = await Promise.all([
    sb.from('products').select('*').order('id', { ascending: true }),
    sb.from('promos').select('*').order('created_at', { ascending: false }),
    sb.from('shop_settings').select('*').eq('id', 1).maybeSingle(),
  ])

  let orders: unknown[] = []
  if (session?.role === 'admin') {
    const { data } = await sb.from('orders').select('*').order('date', { ascending: false }).limit(100)
    orders = data ?? []
  } else if (session?.customerId) {
    const { data } = await sb
      .from('orders')
      .select('*')
      .eq('customer_id', session.customerId)
      .order('date', { ascending: false })
      .limit(50)
    orders = data ?? []
  } else {
    const idsParam = req.nextUrl.searchParams.get('ids')
    if (idsParam) {
      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 30)
      if (ids.length > 0) {
        const { data } = await sb.from('orders').select('*').in('id', ids).order('date', { ascending: false })
        orders = data ?? []
      }
    }
  }

  const shop = shopRow
    ? {
        name: shopRow.name,
        wa: shopRow.wa,
        waLabel: shopRow.wa_label,
        openHour: shopRow.open_hour,
        closeHour: shopRow.close_hour,
        freeShippingMin: shopRow.free_shipping_min,
        shippingFee: shopRow.shipping_fee,
        announcement: shopRow.announcement,
        showBannerPromos: shopRow.show_banner_promos ?? true,
        maxBannerPromos: shopRow.max_banner_promos ?? 2,
        manualStatus: shopRow.manual_status,
      }
    : null

  return NextResponse.json({
    configured: true,
    session,
    products: products ?? [],
    promos: promos ?? [],
    shop,
    orders,
  })
}
