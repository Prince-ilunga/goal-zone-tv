import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body.email || '').toString().trim().toLowerCase()
    const name = (body.name || '').toString().trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Adresse e-mail invalide.' },
        { status: 400 },
      )
    }

    const existing = await db.subscriber.findUnique({ where: { email } })
    if (existing) {
      if (!existing.active) {
        await db.subscriber.update({
          where: { id: existing.id },
          data: { active: true, name: name || existing.name },
        })
        return NextResponse.json({
          ok: true,
          message: 'Inscription réactivée. Merci de votre retour !',
        })
      }
      return NextResponse.json({
        ok: true,
        message: 'Vous êtes déjà inscrit. Merci !',
      })
    }

    await db.subscriber.create({
      data: { email, name: name || null, active: true },
    })

    // Update SiteStats follower count
    const stats = await db.siteStats.findFirst()
    if (stats) {
      await db.siteStats.update({
        where: { id: stats.id },
        data: { followers: { increment: 1 } },
      })
    } else {
      await db.siteStats.create({ data: { followers: 1, articlesCount: 0 } })
    }

    return NextResponse.json({
      ok: true,
      message: 'Inscription confirmée avec succès.',
    })
  } catch (err) {
    console.error('[api/subscribe POST]', err)
    return NextResponse.json(
      { error: 'Inscription impossible.' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const count = await db.subscriber.count({ where: { active: true } })
    return NextResponse.json({ subscribers: count })
  } catch (err) {
    console.error('[api/subscribe GET]', err)
    return NextResponse.json({ subscribers: 0 })
  }
}
