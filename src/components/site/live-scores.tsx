'use client'

import { useState, useEffect } from 'react'
import { Trophy, RefreshCw, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Match {
  id: string
  competition: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: string
  status: 'live' | 'finished' | 'upcoming'
  homeLogo?: string
  awayLogo?: string
}

// Données de démonstration (à remplacer par API-Football quand vous aurez un compte)
const DEMO_MATCHES: Match[] = [
  {
    id: '1',
    competition: 'LINAFOOT',
    homeTeam: 'TP Mazembe',
    awayTeam: 'AS V.Club',
    homeScore: 2,
    awayScore: 1,
    minute: "67'",
    status: 'live',
  },
  {
    id: '2',
    competition: 'Premier League',
    homeTeam: 'Man United',
    awayTeam: 'Man City',
    homeScore: 1,
    awayScore: 1,
    minute: "HT",
    status: 'live',
  },
  {
    id: '3',
    competition: 'CAF Champions League',
    homeTeam: 'Don Bosco',
    awayTeam: 'Tanganyika',
    homeScore: 0,
    awayScore: 0,
    minute: "20:00",
    status: 'upcoming',
  },
  {
    id: '4',
    competition: 'La Liga',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 3,
    awayScore: 2,
    minute: 'FT',
    status: 'finished',
  },
]

export function LiveScores() {
  const [matches, setMatches] = useState<Match[]>(DEMO_MATCHES)
  const [loading, setLoading] = useState(false)

  const refresh = () => {
    setLoading(true)
    // Simulation de rafraîchissement (à remplacer par fetch API-Football)
    setTimeout(() => {
      setMatches((prev) =>
        prev.map((m) =>
          m.status === 'live' && !m.minute.includes('HT')
            ? {
                ...m,
                minute: `${parseInt(m.minute) + 1}'`,
                homeScore: Math.random() > 0.9 ? m.homeScore + 1 : m.homeScore,
                awayScore: Math.random() > 0.95 ? m.awayScore + 1 : m.awayScore,
              }
            : m
        )
      )
      setLoading(false)
    }, 800)
  }

  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight inline-flex items-center gap-2">
            <span className="h-5 w-1 bg-destructive rounded" />
            <Trophy className="h-5 w-5 text-primary" />
            Scores en direct
          </h2>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-display uppercase tracking-wide text-primary hover:underline"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Actualiser
          </button>
        </div>

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
                <span className="text-[10px] font-display font-semibold uppercase tracking-wide text-primary">
                  {m.competition}
                </span>
                {m.status === 'live' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-destructive">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse-dot" />
                    {m.minute}
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
                    <span className={`font-display font-bold text-lg ${m.status === 'live' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {m.homeScore}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{m.awayTeam}</span>
                  {m.status !== 'upcoming' && (
                    <span className={`font-display font-bold text-lg ${m.status === 'live' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {m.awayScore}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          ⚽ Scores en direct bientôt connectés à API-Football pour des données temps réel
        </p>
      </div>
    </section>
  )
}
