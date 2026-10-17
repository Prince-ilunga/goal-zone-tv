'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, RefreshCw, Loader2, ArrowRight, CalendarDays } from 'lucide-react'

interface MatchCard {
  id: string
  competition: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: string
  status: 'live' | 'finished' | 'upcoming'
  matchDate?: string
  source?: 'api-football' | 'manual'
  leagueId?: number
}

interface ScoresResponse {
  matches: MatchCard[]
  source: 'api-football' | 'manual'
  cached: boolean
  updatedAt: string
  error?: string
}

/**
 * Homepage live scores widget.
 *
 * Pulls REAL data from two sources and merges them:
 *  1. /api/scores?live=true         → API-Football live fixtures (cached 10 min)
 *  2. /api/matches?status=live      → manual LINAFOOT/Provincial matches
 *
 * Auto-refreshes every 60 seconds. Shows an empty state (no fake data) when
 * no live matches are available.
 */
export function LiveScores() {
  const [matches, setMatches] = useState<MatchCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLive = useCallback(async () => {
    setError(null)
    try {
      const [liveRes, manualRes] = await Promise.all([
        fetch('/api/scores?live=true', { cache: 'no-store' })
          .then((r) => r.json() as Promise<ScoresResponse>)
          .catch(() => ({ matches: [], source: 'api-football', cached: false, updatedAt: '' }) as ScoresResponse),
        fetch('/api/matches?status=live', { cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => ({ matches: [] })),
      ])

      const apiMatches = (liveRes.matches || []).filter((m) => m.status === 'live')
      const manualMatches = (manualRes.matches || []).filter(
        (m: MatchCard) => m.status === 'live',
      )

      const combined = [...manualMatches, ...apiMatches].slice(0, 4)
      setMatches(combined)
    } catch (err) {
      console.error('[LiveScores] fetch failed', err)
      setError('Indisponible pour le moment')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLive()
    const t = setInterval(fetchLive, 60_000)
    return () => clearInterval(t)
  }, [fetchLive])

  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight inline-flex items-center gap-2">
            <span className="h-5 w-1 bg-destructive rounded" />
            <Trophy className="h-5 w-5 text-primary" />
            Scores en direct
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLive}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-display uppercase tracking-wide text-primary hover:underline disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Actualiser
            </button>
            <Link
              href="/scores"
              className="inline-flex items-center gap-1 text-xs font-display font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              Voir tous les scores
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {loading && matches.length === 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border bg-card p-3"
              />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <p className="font-display text-sm font-semibold uppercase tracking-tight">
              Aucun match en direct maintenant
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Les scores internationaux et LINAFOOT apparaîtront ici dès qu&apos;un match démarre.
            </p>
            <Link
              href="/scores"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              Voir tous les scores
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg border bg-card p-3 ${
                  m.status === 'live'
                    ? 'border-destructive/30 shadow-sm'
                    : m.status === 'finished'
                    ? 'opacity-70'
                    : 'border-dashed'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="truncate text-[10px] font-display font-semibold uppercase tracking-wide text-primary">
                    {m.competition}
                  </span>
                  {m.status === 'live' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-destructive">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse-dot" />
                      {m.minute || 'LIVE'}
                    </span>
                  )}
                  {m.status === 'finished' && (
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Terminé
                    </span>
                  )}
                  {m.status === 'upcoming' && (
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {m.minute}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{m.homeTeam}</span>
                    {m.status !== 'upcoming' && (
                      <span
                        className={`font-display font-bold text-lg tabular-nums ${
                          m.status === 'live' ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {m.homeScore}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{m.awayTeam}</span>
                    {m.status !== 'upcoming' && (
                      <span
                        className={`font-display font-bold text-lg tabular-nums ${
                          m.status === 'live' ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {m.awayScore}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          ⚽ Scores temps réel via API-Football · LINAFOOT & ligues provinciales par GOAL ZONE TV
        </p>
      </div>
    </section>
  )
}
