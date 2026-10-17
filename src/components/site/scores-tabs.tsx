'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Radio,
  CalendarDays,
  Globe2,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle,
  Trophy,
  Clock,
} from 'lucide-react'

// ---------- Types ----------

interface MatchCard {
  id: string
  competition: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: 'live' | 'finished' | 'upcoming'
  minute: string
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

// ---------- League tabs config ----------

const LEAGUE_TABS: { id: number; key: string; label: string; flag: string }[] = [
  { id: 39, key: 'premier-league', label: 'Premier League', flag: '🏴' },
  { id: 140, key: 'la-liga', label: 'La Liga', flag: '🇪🇸' },
  { id: 135, key: 'serie-a', label: 'Serie A', flag: '🇮🇹' },
  { id: 78, key: 'bundesliga', label: 'Bundesliga', flag: '🇩🇪' },
  { id: 61, key: 'ligue-1', label: 'Ligue 1', flag: '🇫🇷' },
  { id: 566, key: 'caf-cl', label: 'CAF Champions League', flag: '🌍' },
  { id: 38, key: 'can', label: 'CAN', flag: '🌍' },
]

// ---------- Helpers ----------

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function formatMatchDate(iso?: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

// ---------- Match card ----------

function MatchCardItem({ m }: { m: MatchCard }) {
  const isLive = m.status === 'live'
  const isFinished = m.status === 'finished'
  const isUpcoming = m.status === 'upcoming'
  return (
    <div
      className={`rounded-xl border bg-card p-4 shadow-sm transition-all ${
        isLive
          ? 'border-destructive/40 shadow-destructive/5'
          : isFinished
          ? 'opacity-70'
          : 'border-dashed border-border'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge
          variant="secondary"
          className="bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary"
        >
          {m.competition}
        </Badge>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-destructive" />
              {m.minute || 'LIVE'}
            </span>
          )}
          {isFinished && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              <Trophy className="size-3" />
              Terminé
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              <Clock className="size-3" />
              {m.minute || 'À venir'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-semibold sm:text-base">
            {m.homeTeam}
          </span>
          {!isUpcoming && (
            <span
              className={`font-display text-2xl font-extrabold tabular-nums ${
                isLive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {m.homeScore}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-semibold sm:text-base">
            {m.awayTeam}
          </span>
          {!isUpcoming && (
            <span
              className={`font-display text-2xl font-extrabold tabular-nums ${
                isLive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {m.awayScore}
            </span>
          )}
        </div>
      </div>

      {m.matchDate && (
        <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          {formatMatchDate(m.matchDate)}
        </p>
      )}
    </div>
  )
}

// ---------- Skeleton ----------

function MatchCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-7 w-6" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-6" />
        </div>
      </div>
    </div>
  )
}

// ---------- Empty state ----------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
        <CalendarDays className="size-6 text-primary" />
      </div>
      <p className="font-display text-base font-semibold uppercase tracking-tight">
        {message}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Revenez bientôt ou rafraîchissez la page.
      </p>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertCircle className="mb-2 size-8 text-destructive" />
      <p className="text-sm font-semibold text-destructive">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-4"
      >
        <RefreshCw className="mr-1 size-3.5" /> Réessayer
      </Button>
    </div>
  )
}

// ---------- Header bar (refresh + meta) ----------

function SubHeader({
  loading,
  cached,
  updatedAt,
  onRefresh,
  cachedLabel,
}: {
  loading: boolean
  cached: boolean
  updatedAt?: string
  onRefresh: () => void
  cachedLabel?: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        {loading ? (
          <>
            <Loader2 className="size-3 animate-spin" /> Chargement…
          </>
        ) : (
          <>
            {cached ? (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-semibold">
                {cachedLabel || 'Cache (10 min)'}
              </Badge>
            ) : (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-semibold">
                Données fraîches
              </Badge>
            )}
            {updatedAt && (
              <span className="hidden sm:inline">
                · MAJ {new Date(updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <RefreshCw className="size-3.5" />
        )}
        <span className="hidden sm:inline">Actualiser</span>
      </Button>
    </div>
  )
}

// ---------- Live tab ----------

function LiveTab() {
  const [apiMatches, setApiMatches] = useState<MatchCard[]>([])
  const [manualMatches, setManualMatches] = useState<MatchCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [liveRes, manualRes] = await Promise.all([
        fetch('/api/scores?live=true', { cache: 'no-store' }).then((r) => r.json() as Promise<ScoresResponse>),
        fetch('/api/matches?status=live', { cache: 'no-store' })
          .then((r) => r.json())
          .catch(() => ({ matches: [] })),
      ])
      setApiMatches(liveRes.matches || [])
      setManualMatches(manualRes.matches || [])
      setCached(!!liveRes.cached)
      setUpdatedAt(liveRes.updatedAt)
    } catch (err) {
      console.error('[scores live]', err)
      setError('Impossible de charger les matchs en direct.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 60_000)
    return () => clearInterval(t)
  }, [fetchAll])

  const allMatches = useMemo(() => {
    // Live first, manual live mixed in
    return [...apiMatches, ...manualMatches]
  }, [apiMatches, manualMatches])

  return (
    <div>
      <SubHeader loading={loading} cached={cached} updatedAt={updatedAt} onRefresh={fetchAll} />
      {error ? (
        <ErrorState message={error} onRetry={fetchAll} />
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : allMatches.length === 0 ? (
        <EmptyState message="Aucun match en direct maintenant" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allMatches.map((m) => (
            <MatchCardItem key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Today tab ----------

function TodayTab() {
  const [matches, setMatches] = useState<MatchCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined)

  const fetchToday = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const today = todayISO()
      const res = await fetch(`/api/scores?date=${today}`, { cache: 'no-store' })
      const data = (await res.json()) as ScoresResponse
      setMatches(data.matches || [])
      setCached(!!data.cached)
      setUpdatedAt(data.updatedAt)
    } catch (err) {
      console.error('[scores today]', err)
      setError('Impossible de charger les matchs du jour.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchToday()
    const t = setInterval(fetchToday, 60_000)
    return () => clearInterval(t)
  }, [fetchToday])

  return (
    <div>
      <SubHeader loading={loading} cached={cached} updatedAt={updatedAt} onRefresh={fetchToday} />
      {error ? (
        <ErrorState message={error} onRetry={fetchToday} />
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState message="Aucun match programmé aujourd'hui" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCardItem key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- International (per league) ----------

function InternationalTab() {
  const [activeLeague, setActiveLeague] = useState<string>('premier-league')
  const [matches, setMatches] = useState<MatchCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined)

  const fetchLeague = useCallback(async () => {
    const league = LEAGUE_TABS.find((l) => l.key === activeLeague)
    if (!league) return
    setLoading(true)
    setError(null)
    try {
      const today = todayISO()
      const res = await fetch(
        `/api/scores?league=${league.id}&date=${today}`,
        { cache: 'no-store' },
      )
      const data = (await res.json()) as ScoresResponse
      setMatches(data.matches || [])
      setCached(!!data.cached)
      setUpdatedAt(data.updatedAt)
    } catch (err) {
      console.error('[scores international]', err)
      setError('Impossible de charger cette ligue.')
    } finally {
      setLoading(false)
    }
  }, [activeLeague])

  useEffect(() => {
    fetchLeague()
  }, [fetchLeague])

  const activeLeagueLabel =
    LEAGUE_TABS.find((l) => l.key === activeLeague)?.label || ''

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {LEAGUE_TABS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLeague(l.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
              activeLeague === l.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <span className="mr-1">{l.flag}</span>
            {l.label}
          </button>
        ))}
      </div>

      <SubHeader
        loading={loading}
        cached={cached}
        updatedAt={updatedAt}
        onRefresh={fetchLeague}
        cachedLabel={`Cache · ${activeLeagueLabel}`}
      />
      {error ? (
        <ErrorState message={error} onRetry={fetchLeague} />
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState message={`Aucun match ${activeLeagueLabel} aujourd'hui`} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCardItem key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- LINAFOOT & RDC (manual) ----------

function LinafootTab() {
  const [matches, setMatches] = useState<MatchCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined)

  const fetchManual = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/matches', { cache: 'no-store' })
      const data = await res.json()
      setMatches(data.matches || [])
      setUpdatedAt(new Date().toISOString())
    } catch (err) {
      console.error('[scores linafoot]', err)
      setError('Impossible de charger les matchs LINAFOOT.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchManual()
    const t = setInterval(fetchManual, 60_000)
    return () => clearInterval(t)
  }, [fetchManual])

  return (
    <div>
      <SubHeader loading={loading} cached={false} updatedAt={updatedAt} onRefresh={fetchManual} cachedLabel="Saisis par GOAL ZONE TV" />
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <MapPin className="size-4 shrink-0 text-primary" />
        <p className="text-xs text-foreground">
          <span className="font-semibold text-primary">Scores saisis par GOAL ZONE TV.</span>{' '}
          LINAFOOT, ligues provinciales (Haut-Katanga), Coupe du Congo et Super
          Coupe RDC — couverture locale par Moïse Kalala.
        </p>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={fetchManual} />
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState message="Aucun match LINAFOOT programmé" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCardItem key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Main component ----------

export function ScoresTabs() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="mb-6 flex h-auto w-full flex-wrap gap-1 bg-secondary/60 p-1 sm:w-fit">
            <TabsTrigger
              value="live"
              className="gap-1.5 py-1.5 data-[state=active]:bg-king-blue data-[state=active]:text-primary-foreground"
            >
              <Radio className="size-4" />
              <span className="hidden sm:inline">En direct</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="today" className="gap-1.5 py-1.5">
              <CalendarDays className="size-4" />
              <span className="hidden sm:inline">Aujourd&apos;hui</span>
              <span className="sm:hidden">Jour</span>
            </TabsTrigger>
            <TabsTrigger value="international" className="gap-1.5 py-1.5">
              <Globe2 className="size-4" />
              International
            </TabsTrigger>
            <TabsTrigger value="linafoot" className="gap-1.5 py-1.5">
              <MapPin className="size-4" />
              <span className="hidden sm:inline">LINAFOOT &amp; RDC</span>
              <span className="sm:hidden">RDC</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-0">
            <LiveTab />
          </TabsContent>
          <TabsContent value="today" className="mt-0">
            <TodayTab />
          </TabsContent>
          <TabsContent value="international" className="mt-0">
            <InternationalTab />
          </TabsContent>
          <TabsContent value="linafoot" className="mt-0">
            <LinafootTab />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
