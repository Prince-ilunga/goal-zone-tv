'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Search, RefreshCw, AlertCircle, Newspaper } from 'lucide-react'
import { ArticleCard } from './article-card'
import { useNewsStore } from '@/lib/news-store'
import { SCOPES, SPORTS, SCOPE_META, SPORT_META, type Article } from '@/lib/types'

interface NewsroomProps {
  initialArticles: Article[]
}

export function Newsroom({ initialArticles }: NewsroomProps) {
  const { query, scope, sport, setQuery, setScope, setSport, reset } =
    useNewsStore()
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchArticles() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (scope !== 'ALL') params.set('scope', scope)
        if (sport !== 'ALL') params.set('sport', sport)
        if (query) params.set('search', query)
        params.set('limit', '24')
        const res = await fetch(`/api/articles?${params.toString()}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Erreur réseau')
        const data = await res.json()
        if (!cancelled) {
          setArticles(data.articles || [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Impossible de charger les articles',
          )
          setArticles(initialArticles)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const t = setTimeout(fetchArticles, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [scope, sport, query])

  return (
    <section id="newsroom" className="mx-auto max-w-7xl px-4 py-10 scroll-mt-32">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-primary">
            Salle de rédaction
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtrez par portée géographique, discipline ou mots-clés. Cliquez un
            article pour le lire en entier.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RefreshCw className="mr-1 size-3.5" /> Réinitialiser
        </Button>
      </header>

      {/* Filtres */}
      <div className="mb-6 space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre, mot-clé, lieu..."
            className="pl-9"
            aria-label="Rechercher dans les articles"
          />
        </div>

        {/* Scope */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Portée :
          </span>
          <FilterButton
            active={scope === 'ALL'}
            onClick={() => setScope('ALL')}
          >
            Toutes
          </FilterButton>
          {SCOPES.map((s) => (
            <FilterButton
              key={s}
              active={scope === s}
              onClick={() => setScope(s)}
            >
              {SCOPE_META[s].label}
            </FilterButton>
          ))}
        </div>

        {/* Sport */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Discipline :
          </span>
          <FilterButton
            active={sport === 'ALL'}
            onClick={() => setSport('ALL')}
          >
            Toutes
          </FilterButton>
          {SPORTS.map((sp) => (
            <FilterButton
              key={sp}
              active={sport === sp}
              onClick={() => setSport(sp)}
            >
              {SPORT_META[sp].emoji} {SPORT_META[sp].label}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* États */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground">
              Affichage des articles de secours.
            </p>
          </CardContent>
        </Card>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Newspaper className="size-12 text-muted-foreground" />
            <p className="font-medium">Aucun article ne correspond à votre recherche.</p>
            <p className="text-sm text-muted-foreground">
              Essayez d&apos;élargir vos filtres ou réinitialisez la recherche.
            </p>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="mr-1 size-3.5" /> Réinitialiser
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </section>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-king-blue px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm'
          : 'rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-primary/10'
      }
    >
      {children}
    </button>
  )
}
