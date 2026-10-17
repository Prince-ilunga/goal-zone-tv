import { SiteHeader } from '@/components/site/site-header'
import { LiveTicker } from '@/components/site/live-ticker'
import { Hero } from '@/components/site/hero'
import { StatsBar } from '@/components/site/stats-bar'
import { FootballFocus } from '@/components/site/football-focus'
import { Newsroom } from '@/components/site/newsroom'
import { JournalistProfile } from '@/components/site/journalist-profile'
import { Subscribe } from '@/components/site/subscribe'
import { ShareSite } from '@/components/site/share-site'
import { SiteFooter } from '@/components/site/site-footer'
import { AdminLauncher } from '@/components/site/admin-launcher'
import { ArticleModal } from '@/components/site/article-modal'
import { db } from '@/lib/db'
import type { Article, Scope, Sport, SiteStats } from '@/lib/types'
import { SubscribeButton } from '@/components/site/subscribe-button'
import { LiveScores } from '@/components/site/live-scores'
import { PushNotificationButton } from '@/components/site/push-notification-button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

function toArticle(a: any): Article {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    scope: a.scope as Scope,
    sport: a.sport as Sport,
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
  }
}

async function getData() {
  const empty = {
    featured: null as Article | null,
    recent: [] as Article[],
    breaking: [] as Article[],
    football: [] as Article[],
    stats: { followers: 1240, articlesCount: 0, breakingCount: 0 } as SiteStats,
  }

  try {
    if (!db) return empty

    const [featured, recent, breaking, football, articlesCount, breakingCount, stats] =
      await Promise.all([
        db.article.findFirst({
          where: { published: true, featured: true },
          orderBy: { createdAt: 'desc' },
        }),
        db.article.findMany({
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          take: 6,
        }),
        db.article.findMany({
          where: { published: true, breaking: true },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
        db.article.findMany({
          where: { published: true, sport: 'FOOTBALL' },
          orderBy: { createdAt: 'desc' },
          take: 12,
        }),
        db.article.count({ where: { published: true } }),
        db.article.count({
          where: { published: true, breaking: true },
        }),
        db.siteStats.findFirst(),
      ])

    // If DB has no articles, auto-seed on first visit
    if (articlesCount === 0) {
      try {
        const seedUrl =
          process.env.NODE_ENV === 'production'
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/seed`
            : 'http://localhost:3000/api/seed'
        await fetch(seedUrl, { method: 'POST' }).catch(() => {})
      } catch {
        // ignore — page will just render empty state
      }
    }

    return {
      // Si aucun article marqué featured, on prend le dernier publié
      featured: toArticle(featured || recent[0] || null),
      recent: recent.map(toArticle),
      breaking: breaking.map(toArticle),
      football: football.map(toArticle),
      stats: {
        followers: stats?.followers ?? 1240,
        articlesCount,
        breakingCount,
      } as SiteStats,
    }
  } catch (err) {
    console.error('[page getData]', err)
    return empty
  }
}

export default async function Home() {
  const { featured, recent, breaking, football, stats } = await getData()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <LiveTicker articles={breaking} />
      <main className="flex-1">
        <Hero featured={featured} recent={recent.slice(0, 5)} />
        <LiveScores />
        <div className="bg-secondary/30 pb-5">
          <div className="container mx-auto max-w-7xl px-4">
            <Link
              href="/scores"
              className="group inline-flex items-center gap-1.5 text-sm font-display font-bold uppercase tracking-wide text-primary hover:underline"
            >
              Voir tous les scores
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <StatsBar stats={stats} />
        <FootballFocus articles={football} />
        <Newsroom initialArticles={recent} />
        <JournalistProfile />
        <Subscribe />
        <ShareSite />
      </main>
      <SiteFooter />
      <AdminLauncher />
      <ArticleModal />
      <SubscribeButton />
    </div>
  )
}
