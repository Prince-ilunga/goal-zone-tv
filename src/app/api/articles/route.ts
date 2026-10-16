import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthorized, unauthorized } from '@/lib/admin-auth'
import { slugify, estimateReadMinutes } from '@/lib/format'
import type { Article, Scope, Sport } from '@/lib/types'

const VALID_SCOPES = ['PROVINCIAL', 'NATIONAL', 'INTERNATIONAL']
const VALID_SPORTS = ['FOOTBALL', 'BASKETBALL', 'BOXE', 'ATHLETISME', 'AUTRE']

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
  const url = new URL(req.url)
  const scope = url.searchParams.get('scope')
  const sport = url.searchParams.get('sport')
  const search = url.searchParams.get('search')
  const featured = url.searchParams.get('featured')
  const breaking = url.searchParams.get('breaking')
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') || '24', 10) || 24,
    100,
  )
  const offset = Math.max(
    parseInt(url.searchParams.get('offset') || '0', 10) || 0,
    0,
  )

  try {
    const where: any = { published: true }
    if (scope && VALID_SCOPES.includes(scope)) where.scope = scope
    if (sport && VALID_SPORTS.includes(sport)) where.sport = sport
    if (featured === 'true') where.featured = true
    if (breaking === 'true') where.breaking = true
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      articles: articles.map(toArticle),
      count: articles.length,
    })
  } catch (err) {
    console.error('[api/articles GET]', err)
    return NextResponse.json(
      { articles: [], error: 'Erreur de chargement' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  try {
    const body = await req.json()
    const {
      title,
      excerpt,
      content,
      scope = 'NATIONAL',
      sport = 'FOOTBALL',
      location = '',
      source = '',
      imageUrl = '',
      videoUrl = '',
      imageAlt = '',
      featured = false,
      breaking = false,
      readMinutes,
    } = body

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Titre, chapô et contenu sont obligatoires.' },
        { status: 400 },
      )
    }

    const finalScope = VALID_SCOPES.includes(scope) ? scope : 'NATIONAL'
    const finalSport = VALID_SPORTS.includes(sport) ? sport : 'FOOTBALL'

    const baseSlug = slugify(title)
    let slug = baseSlug || `article-${Date.now()}`
    const existing = await db.article.findUnique({ where: { slug } })
    if (existing) {
      slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`
    }

    const created = await db.article.create({
      data: {
        title: title.slice(0, 200),
        slug,
        excerpt: excerpt.slice(0, 500),
        content: content.slice(0, 20000),
        scope: finalScope,
        sport: finalSport,
        imageUrl: imageUrl || null,
        imageAlt: imageAlt || null,
        videoUrl: videoUrl || null,
        featured: !!featured,
        breaking: !!breaking,
        location: location || null,
        source: source || null,
        readMinutes:
          typeof readMinutes === 'number'
            ? readMinutes
            : estimateReadMinutes(content),
        published: true,
      },
    })

    return NextResponse.json({
      success: true,
      article: toArticle(created),
    })
  } catch (err) {
    console.error('[api/articles POST]', err)
    return NextResponse.json(
      { error: 'Publication impossible.' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized()
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Paramètre id requis.' },
        { status: 400 },
      )
    }
    await db.article.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/articles DELETE]', err)
    return NextResponse.json(
      { error: 'Suppression impossible.' },
      { status: 500 },
    )
  }
}
