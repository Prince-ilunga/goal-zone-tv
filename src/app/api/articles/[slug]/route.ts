import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Article, Scope, Sport } from '@/lib/types'

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
    likesCount: a.likes?.length ?? 0,
    commentsCount: a.comments?.length ?? 0,
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  try {
    const article = await db.article.findUnique({
      where: { slug },
      include: { likes: true, comments: true },
    })
    if (!article || !article.published) {
      return NextResponse.json(
        { error: 'Article introuvable.' },
        { status: 404 },
      )
    }
    // Increment views (best-effort, non-blocking)
    db.article
      .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
      .catch(() => {})

    return NextResponse.json({ article: toArticle(article) })
  } catch (err) {
    console.error('[api/articles/[slug] GET]', err)
    return NextResponse.json(
      { error: 'Erreur de chargement.' },
      { status: 500 },
    )
  }
}
