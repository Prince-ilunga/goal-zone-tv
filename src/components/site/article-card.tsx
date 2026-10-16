'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, MapPin, Flame, PlayCircle } from 'lucide-react'
import { SCOPE_META, SPORT_META, type Article } from '@/lib/types'
import { timeAgo, formatViews } from '@/lib/format'
import { useArticleModal } from '@/lib/article-modal-store'

type Variant = 'default' | 'list' | 'compact'

interface ArticleCardProps {
  article: Article
  variant?: Variant
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const openArticle = useArticleModal((s) => s.openArticle)
  const scope = SCOPE_META[article.scope]
  const sport = SPORT_META[article.sport]
  const isVideo = !!article.videoUrl

  // --- Compact: tiny list item ---
  if (variant === 'compact') {
    return (
      <button
        onClick={() => openArticle(article)}
        className="group flex w-full items-center gap-3 rounded-md border border-transparent p-2 text-left transition hover:bg-secondary"
      >
        <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
          {isVideo && (
            <PlayCircle className="absolute inset-0 m-auto size-5 text-white drop-shadow" />
          )}
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">
              {sport.emoji}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug group-hover:text-primary">
            {article.title}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {timeAgo(article.createdAt)}
          </span>
        </div>
      </button>
    )
  }

  // --- List: horizontal layout ---
  if (variant === 'list') {
    return (
      <Card
        onClick={() => openArticle(article)}
        className="group cursor-pointer overflow-hidden transition hover:shadow-md"
      >
        <CardContent className="flex gap-4 p-3">
          <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:h-28 sm:w-40">
            {isVideo ? (
              <>
                <img
                  src={article.imageUrl || '/articles/hero-football.png'}
                  alt={article.imageAlt || article.title}
                  className="h-full w-full object-contain"
                />
                <PlayCircle className="absolute inset-0 m-auto size-8 text-white drop-shadow" />
              </>
            ) : (
              <img
                src={article.imageUrl || '/articles/hero-football.png'}
                alt={article.imageAlt || article.title}
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${scope.color}`}
              >
                {scope.short}
              </span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {sport.emoji} {sport.label}
              </Badge>
              {article.breaking && (
                <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                  <Flame className="mr-0.5 size-2.5" /> Breaking
                </Badge>
              )}
            </div>
            <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-primary">
              {article.title}
            </h3>
            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
              {article.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              {article.location && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="size-2.5" />
                  {article.location}
                </span>
              )}
              <span className="inline-flex items-center gap-0.5">
                <Clock className="size-2.5" />
                {timeAgo(article.createdAt)}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Eye className="size-2.5" />
                {formatViews(article.views)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // --- Default: vertical card ---
  return (
    <Card
      onClick={() => openArticle(article)}
      className="group flex cursor-pointer flex-col overflow-hidden transition hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {isVideo ? (
          <>
            <img
              src={article.imageUrl || '/articles/hero-football.png'}
              alt={article.imageAlt || article.title}
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
            <PlayCircle className="absolute inset-0 m-auto size-12 text-white drop-shadow-lg" />
          </>
        ) : (
          <img
            src={article.imageUrl || '/articles/hero-football.png'}
            alt={article.imageAlt || article.title}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shadow ${scope.color}`}
          >
            {scope.label}
          </span>
          {article.breaking && (
            <span className="inline-flex items-center rounded bg-destructive px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow">
              <Flame className="mr-0.5 size-2.5" /> Breaking
            </span>
          )}
        </div>
        <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {sport.emoji} {sport.label}
        </span>
      </div>
      <CardContent className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 line-clamp-2 text-base font-bold leading-snug group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {article.location && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="size-3" />
              {article.location}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5">
            <Clock className="size-3" />
            {timeAgo(article.createdAt)}
          </span>
          <span className="ml-auto inline-flex items-center gap-0.5">
            <Eye className="size-3" />
            {formatViews(article.views)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
