import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArticleCard } from './article-card'
import { Trophy } from 'lucide-react'
import type { Article } from '@/lib/types'

interface FootballFocusProps {
  articles: Article[]
}

export function FootballFocus({ articles }: FootballFocusProps) {
  if (!articles.length) return null

  return (
    <section className="bg-secondary/40 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-king-blue text-primary-foreground shadow-md">
              <Trophy className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-primary">
                Focus Football ⚽
              </h2>
              <p className="text-sm text-muted-foreground">
                Toute l&apos;actualité du ballon rond en RDC, en Afrique et ailleurs.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {articles.length} articles
          </Badge>
        </header>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x">
          {articles.map((a) => (
            <div
              key={a.id}
              className="min-w-[300px] max-w-[360px] snap-start flex-shrink-0 sm:min-w-[340px]"
            >
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
