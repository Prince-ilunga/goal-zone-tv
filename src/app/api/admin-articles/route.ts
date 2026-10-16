import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthorized, unauthorized } from '@/lib/admin-auth'
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
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  try {
    const articles = await db.article.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json({
      articles: articles.map(toArticle),
      count: articles.length,
    })
  } catch (err) {
    console.error('[api/admin-articles GET]', err)
    return NextResponse.json(
      { articles: [], error: 'Chargement impossible.' },
      { status: 500 },
    )
  }
}
