import { createClient } from '@supabase/supabase-js'

function cleanSupabaseUrl(raw?: string) {
  if (!raw) return ''
  try {
    return new URL(raw.trim()).origin
  } catch {
    return raw.trim().replace(/\/+$/, '')
  }
}

export function isSupabaseConfigured() {
  return Boolean(cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getSupabaseAdmin() {
  const url = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
