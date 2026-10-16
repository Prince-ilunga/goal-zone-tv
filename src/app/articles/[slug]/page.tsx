import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { ArticleCard } from '@/components/site/article-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Eye, Clock, MapPin, ChevronRight, Home } from 'lucide-react'
import { SCOPE_META, SPORT_META, type Article, type Scope, type Sport } from '@/lib/types'
import { formatDate, formatViews } from '@/lib/format'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://goalzonetv.cd'

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

interface Params {
  slug: string
}

async function getArticle(slug: string) {
  try {
    if (!db) return null
    const article = await db.article.findUnique({
      where: { slug },
    })
    if (!article || !article.published) return null
    // Increment views (best-effort)
    db.article
      .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
      .catch(() => {})
    return toArticle(article)
  } catch (err) {
    console.error('[articles/[slug] getArticle]', err)
    return null
  }
}

async function getRelated(article: Article) {
  try {
    if (!db) return []
    const related = await db.article.findMany({
      where: {
        published: true,
        sport: article.sport,
        NOT: { id: article.id },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })
    return related.map(toArticle)
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) {
    return { title: 'Article introuvable' }
  }
  const url = `${BASE_URL}/articles/${article.slug}`
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      locale: 'fr_CD',
      url,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.createdAt,
      authors: ['Moïse Kalala'],
      images: article.imageUrl
        ? [{ url: article.imageUrl, width: 1344, height: 768, alt: article.imageAlt || article.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()
  const related = await getRelated(article)

  const scope = SCOPE_META[article.scope]
  const sport = SPORT_META[article.sport]
  const isVideo = !!article.videoUrl
  const shareUrl = `${BASE_URL}/articles/${article.slug}`
  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  const xShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${article.title} — ${shareUrl}`)}`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-6">
          {/* Fil d'Ariane */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-1">
                    <Home className="size-3" /> Accueil
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/?scope=${article.scope}`}>
                  {scope.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  {article.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* En-tête */}
          <header className="mb-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className={`${scope.color} border-0`}>{scope.label}</Badge>
              <Badge variant="secondary">{sport.emoji} {sport.label}</Badge>
              {article.breaking && (
                <Badge variant="destructive">Breaking</Badge>
              )}
              {isVideo && <Badge className="bg-black text-white">▶ Vidéo</Badge>}
            </div>
            <h1 className="text-balance font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {article.excerpt}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-y py-3 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">
                Par Moïse Kalala
              </span>
              {article.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> {article.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {formatDate(article.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3.5" /> {formatViews(article.views)} vues
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {article.readMinutes} min
              </span>
              {article.source && (
                <span className="rounded bg-secondary px-2 py-0.5">
                  Source : {article.source}
                </span>
              )}
            </div>
          </header>

          {/* Média */}
          {(isVideo || article.imageUrl) && (
            <div className="mb-6 overflow-hidden rounded-xl bg-muted shadow-md">
              {isVideo ? (
                <video
                  src={article.videoUrl!}
                  poster={article.imageUrl || undefined}
                  controls
                  className="aspect-video w-full object-contain"
                />
              ) : (
                <img
                  src={article.imageUrl!}
                  alt={article.imageAlt || article.title}
                  className="aspect-video w-full object-cover"
                />
              )}
            </div>
          )}

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n').map((para, i) =>
              para.trim() ? (
                <p key={i} className="mb-4 leading-relaxed text-foreground/90">
                  {para}
                </p>
              ) : null,
            )}
          </div>

          {/* Partage */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-5">
            <span className="text-sm font-semibold">Partager :</span>
            <a href={fbShare} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90">
                Facebook
              </Button>
            </a>
            <a href={xShare} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="bg-black text-white hover:bg-black/90">
                X / Twitter
              </Button>
            </a>
            <a href={waShare} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="bg-[#25D366] text-white hover:bg-[#25D366]/90">
                WhatsApp
              </Button>
            </a>
          </div>
        </article>

        {/* Articles liés */}
        {related.length > 0 && (
          <section className="border-t bg-secondary/30 py-10">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-primary">
                    À lire aussi
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    D&apos;autres articles en {sport.label.toLowerCase()}.
                  </p>
                </div>
                <Link href="/" className="text-sm text-primary hover:underline">
                  Tous les articles <ChevronRight className="inline size-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />

      {/* Structured Data JSON-LD pour Google News / rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.excerpt,
            image: article.imageUrl ? [article.imageUrl.startsWith('http') ? article.imageUrl : BASE_URL + article.imageUrl] : undefined,
            datePublished: article.createdAt.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            author: {
              '@type': 'Person',
              name: 'Moïse Kalala',
              url: BASE_URL,
            },
            publisher: {
              '@type': 'Organization',
              name: 'GOAL ZONE TV',
              logo: {
                '@type': 'ImageObject',
                url: BASE_URL + '/logo.jpg',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${BASE_URL}/articles/${article.slug}`,
            },
            articleSection: sportMeta.label,
            about: scopeMeta.label,
            inLanguage: 'fr-FR',
          }),
        }}
      />
    </div>
  )
}
