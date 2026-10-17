import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { LiveTicker } from '@/components/site/live-ticker'
import { ScoresTabs } from '@/components/site/scores-tabs'
import { db } from '@/lib/db'
import type { Article } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Scores en direct — GOAL ZONE TV',
  description:
    "Scores de football en direct : LINAFOOT, ligues provinciales, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, CAF Champions League et CAN. Mis à jour en temps réel via API-Football.",
  alternates: { canonical: '/scores' },
  openGraph: {
    title: 'Scores en direct — GOAL ZONE TV',
    description:
      'Live scores LINAFOOT + International (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, CAF, CAN).',
    url: '/scores',
    type: 'website',
  },
}

export default async function ScoresPage() {
  // Pull breaking articles for the live ticker (graceful fallback)
  let breaking: Article[] = []
  try {
    if (db) {
      const rows = await db.article.findMany({
        where: { published: true, breaking: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      })
      breaking = rows.map((a: any) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        scope: a.scope,
        sport: a.sport,
        imageUrl: a.imageUrl ?? null,
        imageAlt: a.imageAlt ?? null,
        videoUrl: a.videoUrl ?? null,
        featured: a.featured,
        breaking: a.breaking,
        views: a.views,
        readMinutes: a.readMinutes,
        source: a.source ?? null,
        location: a.location ?? null,
        published: a.published,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })) as Article[]
    }
  } catch (err) {
    console.error('[scores page] breaking fetch failed', err)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <LiveTicker articles={breaking} />
      <main className="flex-1">
        <section className="border-b border-border bg-king-blue text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground/70">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse-dot rounded-full bg-destructive align-middle" />
              TEMPS RÉEL · API-FOOTBALL
            </p>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
              Scores en direct
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-primary-foreground/80 sm:text-base">
              Tous les résultats football en temps réel : LINAFOOT & ligues
              provinciales (saisis par GOAL ZONE TV), Premier League, La Liga,
              Serie A, Bundesliga, Ligue 1, CAF Champions League et CAN.
            </p>
          </div>
        </section>

        <ScoresTabs />
      </main>
      <SiteFooter />
    </div>
  )
}
