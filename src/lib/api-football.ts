/**
 * API-Football v3 helper.
 *
 * Documentation: https://www.api-football.com/documentation-v3
 * Base URL:      https://v3.football.api-sports.io
 *
 * Quota: 100 requests/day on the free plan. To avoid burning the quota on
 * concurrent calls, we de-duplicate in-flight requests (if a request for the
 * same key is already pending, we await it instead of firing a second one).
 * We do NOT cache the result — every call hits the API so the scores are
 * always fresh (live, no delay).
 *
 * All public functions return a normalised `FixtureMatch` array and never
 * throw — if the upstream API fails we simply return [] so the UI can
 * degrade to an empty state instead of crashing the page.
 */

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || ''
const BASE_URL = 'https://v3.football.api-sports.io'

/** League IDs we follow on GOAL ZONE TV. */
export const LEAGUES = {
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  SERIE_A: 135,
  BUNDESLIGA: 78,
  LIGUE_1: 61,
  CAF_CHAMPIONS_LEAGUE: 566,
  CAN: 38, // Coupe d'Afrique des Nations (Africa Cup of Nations)
} as const

export type LeagueKey = keyof typeof LEAGUES

/** Reverse lookup: leagueId → human label. */
export const LEAGUE_LABELS: Record<number, string> = {
  [LEAGUES.PREMIER_LEAGUE]: 'Premier League',
  [LEAGUES.LA_LIGA]: 'La Liga',
  [LEAGUES.SERIE_A]: 'Serie A',
  [LEAGUES.BUNDESLIGA]: 'Bundesliga',
  [LEAGUES.LIGUE_1]: 'Ligue 1',
  [LEAGUES.CAF_CHAMPIONS_LEAGUE]: 'CAF Champions League',
  [LEAGUES.CAN]: "Coupe d'Afrique des Nations",
}

/** List of "tracked" league IDs (used for "today across all leagues"). */
export const TRACKED_LEAGUE_IDS: number[] = Object.values(LEAGUES)

export type FixtureStatus = 'live' | 'finished' | 'upcoming'

export interface FixtureMatch {
  id: string
  competition: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: string
  status: FixtureStatus
  leagueId: number
  matchDate?: string
}

interface ApiFixture {
  fixture: {
    id: number
    date?: string
    status?: {
      short?: string
      long?: string
      elapsed?: number | null
    }
  }
  league?: {
    id?: number
    name?: string
    country?: string
  }
  teams?: {
    home?: { id?: number; name?: string }
    away?: { id?: number; name?: string }
  }
  goals?: {
    home?: number | null
    away?: number | null
  }
}

/**
 * In-flight request de-duplication map.
 * Key: request signature ; Value: the Promise resolving to the raw fixtures.
 * Entries are deleted once the promise settles so the next call always hits
 * the API again (no time-based cache — scores stay live).
 */
const inflight = new Map<string, Promise<ApiFixture[] | null>>()

async function fetchApi(
  path: string,
  params: Record<string, string | number>,
): Promise<ApiFixture[] | null> {
  if (!API_FOOTBALL_KEY) {
    console.warn('[api-football] API_FOOTBALL_KEY missing — skipping request')
    return null
  }

  const url = new URL(`${BASE_URL}${path}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v))
  }

  const signature = url.toString()

  // If a request for the exact same URL is already in-flight, await it
  // instead of firing a second one. This prevents burning the quota when
  // several components mount at the same time.
  const existing = inflight.get(signature)
  if (existing) return existing

  const request = (async () => {
    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-apisports-key': API_FOOTBALL_KEY,
          'x-rapidapi-key': API_FOOTBALL_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
        cache: 'no-store',
      })
      if (!res.ok) {
        console.warn(
          `[api-football] HTTP ${res.status} for ${path}?${url.searchParams.toString()}`,
        )
        return null
      }
      const data = (await res.json()) as { response?: ApiFixture[]; errors?: unknown }
      if (data.errors) {
        console.warn('[api-football] API errors:', data.errors)
      }
      return Array.isArray(data.response) ? data.response : []
    } catch (err) {
      console.error('[api-football] fetch failed:', err)
      return null
    }
  })()

  inflight.set(signature, request)
  try {
    return await request
  } finally {
    inflight.delete(signature)
  }
}

/**
 * Map an API-Football fixture to our normalised FixtureMatch shape.
 */
function normaliseFixture(f: ApiFixture): FixtureMatch | null {
  if (!f.fixture || !f.teams?.home || !f.teams?.away) return null
  const home = f.teams.home
  const away = f.teams.away
  const leagueId = f.league?.id ?? 0
  const statusLong = f.fixture.status?.long || ''
  const statusShort = f.fixture.status?.short || ''
  const elapsed = f.fixture.status?.elapsed ?? null

  let status: FixtureStatus = 'upcoming'
  let minute = ''

  // API-Football status codes:
  // 1H / 2H / ET / P → live ; HT → live (half-time) ; FT / AET / PEN → finished
  // NS / TBD / PST → upcoming
  if (
    statusShort === '1H' ||
    statusShort === '2H' ||
    statusShort === 'ET' ||
    statusShort === 'P' ||
    statusShort === 'BT' ||
    statusShort === 'LIVE'
  ) {
    status = 'live'
    minute = elapsed ? `${elapsed}'` : 'LIVE'
  } else if (statusShort === 'HT') {
    status = 'live'
    minute = 'MT'
  } else if (
    statusShort === 'FT' ||
    statusShort === 'AET' ||
    statusShort === 'PEN' ||
    statusLong.toLowerCase().includes('finished')
  ) {
    status = 'finished'
    minute = 'FT'
  } else if (statusShort === 'NS' || statusShort === 'TBD' || statusShort === 'PST') {
    status = 'upcoming'
    if (f.fixture.date) {
      try {
        const d = new Date(f.fixture.date)
        minute = d.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        minute = ''
      }
    }
  } else if (elapsed && elapsed > 0) {
    status = 'live'
    minute = `${elapsed}'`
  } else if (statusLong.toLowerCase().includes('not started')) {
    status = 'upcoming'
    if (f.fixture.date) {
      try {
        const d = new Date(f.fixture.date)
        minute = d.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        minute = ''
      }
    }
  } else if (statusLong.toLowerCase().includes('finished')) {
    status = 'finished'
    minute = 'FT'
  }

  return {
    id: `apf-${f.fixture.id}`,
    competition: f.league?.name || LEAGUE_LABELS[leagueId] || 'International',
    homeTeam: home.name || 'Équipe 1',
    awayTeam: away.name || 'Équipe 2',
    homeScore: f.goals?.home ?? 0,
    awayScore: f.goals?.away ?? 0,
    minute,
    status,
    leagueId,
    matchDate: f.fixture.date,
  }
}

/** Fetch fixtures for a given date (YYYY-MM-DD) across all leagues. */
export async function fetchFixturesByDate(date: string): Promise<FixtureMatch[]> {
  const raw = await fetchApi('/fixtures', { date })
  return (raw || [])
    .map(normaliseFixture)
    .filter((m): m is FixtureMatch => m !== null)
}

/** Fetch all currently live fixtures (any league). */
export async function fetchLiveFixtures(): Promise<FixtureMatch[]> {
  const raw = await fetchApi('/fixtures', { live: 'all' })
  return (raw || [])
    .map(normaliseFixture)
    .filter((m): m is FixtureMatch => m !== null)
}

/** Fetch fixtures filtered by league + date (YYYY-MM-DD). */
export async function fetchFixturesByLeague(
  leagueId: number,
  date: string,
): Promise<FixtureMatch[]> {
  const raw = await fetchApi('/fixtures', { league: leagueId, date })
  return (raw || [])
    .map(normaliseFixture)
    .filter((m): m is FixtureMatch => m !== null)
}

/**
 * Live accessor — used by the /api/scores endpoint. Always hits the API
 * (no time-based cache) so scores are always fresh.
 *
 * - `live=true`                → live fixtures across all leagues
 * - `league=ID&date=YYYY-MM-DD` → fixtures for that league on that date
 * - `date=YYYY-MM-DD`          → all fixtures on that date
 *
 * Returns the matches, the source ("api-football") and cached=false (always
 * fresh, we never serve a stale cached value).
 */
export async function getCachedFixtures(opts: {
  live?: boolean
  league?: number
  date?: string
}): Promise<{ matches: FixtureMatch[]; cached: boolean }> {
  if (opts.live) {
    const matches = await fetchLiveFixtures()
    return { matches, cached: false }
  }
  if (opts.league && opts.date) {
    const matches = await fetchFixturesByLeague(opts.league, opts.date)
    return { matches, cached: false }
  }
  if (opts.date) {
    const matches = await fetchFixturesByDate(opts.date)
    return { matches, cached: false }
  }
  // Default: today across all tracked leagues
  const today = new Date().toISOString().split('T')[0]
  const all = await fetchFixturesByDate(today)
  // Keep only tracked leagues so we don't pollute the homepage with obscure ones
  const filtered = all.filter((m) => TRACKED_LEAGUE_IDS.includes(m.leagueId))
  return { matches: filtered, cached: false }
}

/** Returns today's date as YYYY-MM-DD (server local time). */
export function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}
