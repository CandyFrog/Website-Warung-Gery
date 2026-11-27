import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export type SessionPayload = {
  role: 'user' | 'admin'
  customerId?: string
  name?: string
  phone?: string
  address?: string
  exp: number
}

const COOKIE_NAME = 'wg_session'

function getSecret() {
  return process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'warung-gery-dev-secret-key'
}

export function hashPin(pin: string) {
  return createHmac('sha256', getSecret()).update(pin.trim()).digest('hex')
}

export function signSession(payload: Omit<SessionPayload, 'exp'>) {
  const full: SessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 days
  }
  const data = Buffer.from(JSON.stringify(full)).toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = createHmac('sha256', getSecret()).update(data).digest('base64url')
  const a = new Uint8Array(Buffer.from(sig))
  const b = new Uint8Array(Buffer.from(expected))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload
    if (parsed.exp < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

export function getSession(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value
  return verifySession(token)
}

export function setSessionCookie(res: NextResponse, payload: Omit<SessionPayload, 'exp'>) {
  const token = signSession(payload)
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 14,
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
