import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const BUCKET = 'product-images'

export async function POST(req: NextRequest) {
  const session = getSession()
  if (session?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = getSupabaseAdmin()
  if (!sb) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File gambar tidak ditemukan.' }, { status: 400 })
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran gambar maksimal 4 MB.' }, { status: 400 })
  }

  // Ensure public bucket exists (auto-creates on first upload)
  const { data: buckets } = await sb.storage.listBuckets()
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: bucketErr } = await sb.storage.createBucket(BUCKET, { public: true })
    if (bucketErr) {
      return NextResponse.json({ error: bucketErr.message }, { status: 500 })
    }
  }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'produk'
  const path = `${Date.now()}-${base}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || 'image/png',
    upsert: true,
  })

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: pub.publicUrl })
}
