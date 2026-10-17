import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthorized, unauthorized } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const VALID_STATUSES = ['live', 'finished', 'upcoming']

const DEFAULT_COMPETITIONS = [
  'LINAFOOT',
  'Ligue Provinciale Haut-Katanga',
  'Coupe du Congo',
  'Super Coupe RDC',
  'CHAN',
  'Coupe CAF',
  'Autre',
]

function toMatch(m: any) {
  return {
    id: m.id,
    competition: m.competition,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore ?? 0,
    awayScore: m.awayScore ?? 0,
    status: (m.status as 'live' | 'finished' | 'upcoming') || 'upcoming',
    minute: m.minute ?? '',
    matchDate: m.matchDate instanceof Date ? m.matchDate.toISOString() : m.matchDate,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
  }
}

/**
 * GET /api/matches
 * Public — list manual matches stored in DB.
 * Optional ?status=live|finished|upcoming
 */
export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ matches: [] })
    }
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const where: any = {}
    if (status && VALID_STATUSES.includes(status)) {
      where.status = status
    }
    const matches = await db.match.findMany({
      where,
      orderBy: [{ status: 'asc' }, { matchDate: 'desc' }],
      take: 200,
    })
    return NextResponse.json({
      matches: matches.map(toMatch),
      count: matches.length,
      competitions: DEFAULT_COMPETITIONS,
    })
  } catch (err) {
    console.error('[api/matches GET]', err)
    return NextResponse.json(
      { matches: [], error: 'Erreur de chargement des matchs.' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/matches — create a manual match (auth required).
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  if (!db) {
    return NextResponse.json(
      { error: 'Base de données indisponible.' },
      { status: 503 },
    )
  }
  try {
    const body = await req.json()
    const {
      competition,
      homeTeam,
      awayTeam,
      homeScore = 0,
      awayScore = 0,
      status = 'upcoming',
      minute = '',
      matchDate,
    } = body

    if (!competition || !homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: 'Compétition, équipe domicile et équipe extérieur sont obligatoires.' },
        { status: 400 },
      )
    }

    const finalStatus = VALID_STATUSES.includes(status) ? status : 'upcoming'
    const finalHomeScore =
      typeof homeScore === 'number' && !isNaN(homeScore) ? Math.max(0, homeScore) : 0
    const finalAwayScore =
      typeof awayScore === 'number' && !isNaN(awayScore) ? Math.max(0, awayScore) : 0

    let parsedDate: Date
    if (matchDate) {
      const d = new Date(matchDate)
      parsedDate = isNaN(d.getTime()) ? new Date() : d
    } else {
      parsedDate = new Date()
    }

    const created = await db.match.create({
      data: {
        competition: String(competition).slice(0, 120),
        homeTeam: String(homeTeam).slice(0, 120),
        awayTeam: String(awayTeam).slice(0, 120),
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        status: finalStatus,
        minute: String(minute || '').slice(0, 20),
        matchDate: parsedDate,
      },
    })

    return NextResponse.json({ success: true, match: toMatch(created) })
  } catch (err) {
    console.error('[api/matches POST]', err)
    return NextResponse.json(
      { error: 'Création du match impossible.' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/matches?id=xxx — update a manual match (auth required).
 */
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  if (!db) {
    return NextResponse.json(
      { error: 'Base de données indisponible.' },
      { status: 503 },
    )
  }
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Paramètre id requis.' },
        { status: 400 },
      )
    }
    const body = await req.json()
    const data: any = {}
    if (body.competition !== undefined)
      data.competition = String(body.competition).slice(0, 120)
    if (body.homeTeam !== undefined)
      data.homeTeam = String(body.homeTeam).slice(0, 120)
    if (body.awayTeam !== undefined)
      data.awayTeam = String(body.awayTeam).slice(0, 120)
    if (body.homeScore !== undefined)
      data.homeScore = Math.max(0, Number(body.homeScore) || 0)
    if (body.awayScore !== undefined)
      data.awayScore = Math.max(0, Number(body.awayScore) || 0)
    if (body.status !== undefined) {
      data.status = VALID_STATUSES.includes(body.status) ? body.status : 'upcoming'
    }
    if (body.minute !== undefined)
      data.minute = String(body.minute || '').slice(0, 20)
    if (body.matchDate !== undefined) {
      const d = new Date(body.matchDate)
      if (!isNaN(d.getTime())) data.matchDate = d
    }

    const updated = await db.match.update({ where: { id }, data })
    return NextResponse.json({ success: true, match: toMatch(updated) })
  } catch (err) {
    console.error('[api/matches PUT]', err)
    return NextResponse.json(
      { error: 'Mise à jour du match impossible.' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/matches?id=xxx — delete a manual match (auth required).
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  if (!db) {
    return NextResponse.json(
      { error: 'Base de données indisponible.' },
      { status: 503 },
    )
  }
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Paramètre id requis.' },
        { status: 400 },
      )
    }
    await db.match.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/matches DELETE]', err)
    return NextResponse.json(
      { error: 'Suppression du match impossible.' },
      { status: 500 },
    )
  }
}

export { DEFAULT_COMPETITIONS }
