import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Server-side admin authentication.
 * - Login via password → returns a signed JWT-like session token (HMAC SHA-256).
 * - Token is valid for 24 hours.
 * - Authorize accepts either `x-admin-token` (preferred) or `x-admin-password` (legacy).
 */

const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24h

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    'gztv-fallback-secret-do-not-use-in-prod-please-set-ADMIN_SESSION_SECRET'
  )
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Token format: base64url(payload).base64url(hmac)
 * payload = { iat, exp }
 */
export function createSessionToken(): string {
  const now = Date.now()
  const payload = { iat: now, exp: now + SESSION_TTL_MS }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payloadB64, sig] = parts
  const expectedSig = createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length) return false
  if (!timingSafeEqual(a, b)) return false
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    ) as { iat: number; exp: number }
    if (!payload.exp || Date.now() > payload.exp) return false
    return true
  } catch {
    return false
  }
}

/**
 * Authorize a request: accepts either a session token (x-admin-token header)
 * or a raw password (x-admin-password header) for convenience.
 */
export function isAuthorized(req: Request): boolean {
  const token = req.headers.get('x-admin-token')
  if (token && verifySessionToken(token)) return true
  const password = req.headers.get('x-admin-password')
  if (password && verifyAdminPassword(password)) return true
  return false
}

export function unauthorized(): Response {
  return new Response(
    JSON.stringify({ error: 'Non autorisé. Identifiants admin requis.' }),
    {
      status: 401,
      headers: { 'content-type': 'application/json' },
    },
  )
}
