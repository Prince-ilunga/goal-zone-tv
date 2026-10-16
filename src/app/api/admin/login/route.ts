import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, createSessionToken } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const password = (body.password || '').toString()
    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis.' },
        { status: 400 },
      )
    }
    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect.' },
        { status: 401 },
      )
    }
    const token = createSessionToken()
    return NextResponse.json({
      token,
      expiresIn: 24 * 60 * 60,
      message: 'Connexion réussie.',
    })
  } catch (err) {
    console.error('[api/admin/login POST]', err)
    return NextResponse.json(
      { error: 'Erreur serveur.' },
      { status: 500 },
    )
  }
}
