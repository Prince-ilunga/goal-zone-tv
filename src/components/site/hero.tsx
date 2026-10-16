'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Flame, ArrowRight, Clock } from 'lucide-react'
import { SCOPE_META, SPORT_META, type Article } from '@/lib/types'
import { timeAgo, formatViews } from '@/lib/format'
import { useArticleModal } from '@/lib/article-modal-store'

interface HeroProps {
  featured: Article | null
  recent: Article[]
}

export function Hero({ featured: initialFeatured, recent: initialRecent }: HeroProps) {
  const openArticle = useArticleModal((s) => s.openArticle)
  // On récupère toujours les derniers articles côté client pour contourner
  // le cache Vercel qui peut servir un HTML obsolète.
  const [featured, setFeatured] = useState<Article | null>(initialFeatured)
  const [recent, setRecent] = useState<Article[]>(initialRecent)

  useEffect(() => {
    let cancelled = false
    fetch('/api/articles?limit=6', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled || !data?.articles?.length) return
        const arts = data.articles as Article[]
        const featuredOne = arts.find((a) => a.featured) || arts[0]
        setFeatured(featuredOne)
        setRecent(arts.filter((a) => a.id !== featuredOne.id).slice(0, 5))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!featured) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-dashed bg-secondary/40 p-10 text-center text-muted-foreground">
          Aucun article à la une pour le moment. Revenez bientôt.
        </div>
      </section>
    )
  }

  const scope = SCOPE_META[featured.scope]
  const sport = SPORT_META[featured.sport]
  const isVideo = !!featured.videoUrl

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Article à la une */}
        <article className="group relative overflow-hidden rounded-xl bg-card shadow-md ring-1 ring-border lg:col-span-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            {isVideo ? (
              <video
                src={featured.videoUrl!}
                poster={featured.imageUrl || undefined}
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={featured.imageUrl || '/articles/hero-football.png'}
                alt={featured.imageAlt || featured.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={`${scope.color} border-0`}>{scope.label}</Badge>
              <Badge variant="secondary" className="border-0 bg-white/90 text-primary">
                {sport.emoji} {sport.label}
              </Badge>
              {featured.breaking && (
                <Badge className="border-0 bg-destructive text-white">
                  <Flame className="mr-1 size-3" /> Breaking
                </Badge>
              )}
              {isVideo && (
                <Badge className="border-0 bg-black/70 text-white">▶ Vidéo</Badge>
              )}
            </div>
            <h1 className="mb-2 text-balance font-display text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
              {featured.title}
            </h1>
            <p className="mb-3 line-clamp-2 max-w-3xl text-sm text-white/85 sm:text-base">
              {featured.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
              {featured.location && (
                <span className="font-medium">📍 {featured.location}</span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" /> {timeAgo(featured.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3" /> {formatViews(featured.views)}
              </span>
              <Button
                onClick={() => openArticle(featured)}
                size="sm"
                className="ml-2 bg-king-blue hover:bg-primary/90"
              >
                Lire l&apos;article <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </div>
          </div>
        </article>

        {/* Colonne secondaire */}
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-lg font-bold text-primary">
              Plus récents
            </h2>
            <span className="text-xs text-muted-foreground">{recent.length} articles</span>
          </div>
          <div className="flex max-h-[460px] flex-col gap-2 overflow-y-auto scrollbar-thin pr-1">
            {recent.length === 0 && (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Aucun article récent.
                </CardContent>
              </Card>
            )}
            {recent.map((a) => {
              const sp = SCOPE_META[a.scope]
              return (
                <button
                  key={a.id}
                  onClick={() => openArticle(a)}
                  className="group flex items-start gap-3 rounded-lg border bg-card p-3 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md"
                >
                  <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {a.imageUrl || a.videoUrl ? (
                      <img
                        src={a.imageUrl || '/articles/hero-football.png'}
                        alt={a.imageAlt || a.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        {SPORT_META[a.sport].emoji}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${sp.color}`}
                      >
                        {sp.short}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(a.createdAt)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                      {a.title}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </section>
  )
}
