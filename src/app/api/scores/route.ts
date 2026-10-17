import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  getCachedFixtures,
  todayDate,
  type FixtureMatch,
} from '@/lib/api-football'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ManualMatch {
  id: string
  competition: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: 'live' | 'finished' | 'upcoming'
  minute: string
  matchDate: string
  createdAt: string
  updatedAt: string
  source: 'manual'
}

function toManualMatch(m: any): ManualMatch {
  return {
    id: m.id,
    competition: m.competition,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore ?? 0,
    awayScore: m.awayScore ?? 0,
    status: (m.status as ManualMatch['status']) || 'upcoming',
    minute: m.minute ?? '',
    matchDate: m.matchDate instanceof Date ? m.matchDate.toISOString() : m.matchDate,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
    source: 'manual',
  }
}

/**
 * GET /api/scores
 *
 * Query params:
 *  - manual=true              → return matches stored in DB (LINAFOOT, etc.)
 *  - live=true                → live fixtures from API-Football (cached 10 min)
 *  - league=ID&date=YYYY-MM-DD → fixtures for that league on that date
 *  - date=YYYY-MM-DD          → all fixtures on that date (tracked leagues)
 *
 * Default (no params): today's fixtures across all tracked leagues.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const params = url.searchParams

  const isManual = params.get('manual') === 'true'
  const isLive = params.get('live') === 'true'
  const leagueParam = params.get('league')
  const dateParam = params.get('date') || todayDate()

  // ---- MANUAL (DB) ----
  if (isManual) {
    try {
      if (!db) {
        return NextResponse.json({
          matches: [],
          source: 'manual',
          cached: false,
          updatedAt: new Date().toISOString(),
        })
      }
      const statusFilter = params.get('status')
      const where: any = {}
      if (
        statusFilter &&
        ['live', 'finished', 'upcoming'].includes(statusFilter)
      ) {
        where.status = statusFilter
      }
      const matches = await db.match.findMany({
        where,
        orderBy: [{ status: 'asc' }, { matchDate: 'desc' }],
        take: 100,
      })
      return NextResponse.json({
        matches: matches.map(toManualMatch),
        source: 'manual',
        cached: false,
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[api/scores manual GET]', err)
      return NextResponse.json(
        {
          matches: [],
          source: 'manual',
          cached: false,
          updatedAt: new Date().toISOString(),
          error: 'Erreur de chargement des matchs manuels',
        },
        { status: 500 },
      )
    }
  }

  // ---- API-FOOTBALL ----
  try {
    const leagueId = leagueParam ? parseInt(leagueParam, 10) : undefined
    const { matches, cached } = await getCachedFixtures({
      live: isLive,
      league: Number.isNaN(leagueId) ? undefined : leagueId,
      date: isLive ? undefined : dateParam,
    })

    // Sort: live first, then upcoming, then finished
    const statusOrder: Record<string, number> = {
      live: 0,
      upcoming: 1,
      finished: 2,
    }
    const sorted = [...matches].sort((a, b) => {
      const sa = statusOrder[a.status] ?? 3
      const sb = statusOrder[b.status] ?? 3
      if (sa !== sb) return sa - sb
      // within same status: by matchDate ascending
      const da = a.matchDate ? new Date(a.matchDate).getTime() : 0
      const db_ = b.matchDate ? new Date(b.matchDate).getTime() : 0
      return da - db_
    })

    return NextResponse.json({
      matches: sorted,
      source: 'api-football',
      cached,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[api/scores api-football GET]', err)
    return NextResponse.json({
      matches: [] as FixtureMatch[],
      source: 'api-football',
      cached: false,
      updatedAt: new Date().toISOString(),
      error: 'API-Football indisponible pour le moment',
    })
  }
}
