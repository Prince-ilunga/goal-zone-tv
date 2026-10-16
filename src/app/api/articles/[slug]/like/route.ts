import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

function getFingerprint(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  const ua = req.headers.get('user-agent') || ''
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  try {
    const article = await db.article.findUnique({
      where: { slug },
      select: { id: true, likes: { select: { fingerprint: true } } },
    })
    if (!article) {
      return NextResponse.json(
        { error: 'Article introuvable.' },
        { status: 404 },
      )
    }
    const fp = getFingerprint(req)
    const liked = article.likes.some((l) => l.fingerprint === fp)
    return NextResponse.json({
      likesCount: article.likes.length,
      liked,
    })
  } catch (err) {
    console.error('[api/articles/[slug]/like GET]', err)
    return NextResponse.json(
      { likesCount: 0, liked: false },
      { status: 500 },
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  try {
    const article = await db.article.findUnique({
      where: { slug },
      select: { id: true, likes: { select: { fingerprint: true } } },
    })
    if (!article) {
      return NextResponse.json(
        { error: 'Article introuvable.' },
        { status: 404 },
      )
    }
    const fp = getFingerprint(req)
    const existing = await db.like.findUnique({
      where: { articleId_fingerprint: { articleId: article.id, fingerprint: fp } },
    })

    let liked: boolean
    if (existing) {
      await db.like.delete({ where: { id: existing.id } })
      liked = false
    } else {
      await db.like.create({ data: { articleId: article.id, fingerprint: fp } })
      liked = true
    }

    const count = await db.like.count({ where: { articleId: article.id } })
    return NextResponse.json({ liked, likesCount: count })
  } catch (err) {
    console.error('[api/articles/[slug]/like POST]', err)
    return NextResponse.json(
      { error: 'Action impossible.' },
      { status: 500 },
    )
  }
}
