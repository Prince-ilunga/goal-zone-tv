import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Comment } from '@/lib/types'

function toComment(c: any): Comment {
  return {
    id: c.id,
    articleId: c.articleId,
    name: c.name,
    content: c.content,
    approved: c.approved,
    createdAt: c.createdAt,
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
      select: { id: true },
    })
    if (!article) {
      return NextResponse.json(
        { error: 'Article introuvable.' },
        { status: 404 },
      )
    }
    const comments = await db.comment.findMany({
      where: { articleId: article.id, approved: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      comments: comments.map(toComment),
      count: comments.length,
    })
  } catch (err) {
    console.error('[api/articles/[slug]/comments GET]', err)
    return NextResponse.json(
      { comments: [], error: 'Chargement impossible.' },
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
    const body = await req.json()
    const name = (body.name || '').toString().trim().slice(0, 60)
    const content = (body.content || '').toString().trim().slice(0, 1500)

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Nom et commentaire sont obligatoires.' },
        { status: 400 },
      )
    }

    const article = await db.article.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!article) {
      return NextResponse.json(
        { error: 'Article introuvable.' },
        { status: 404 },
      )
    }

    const created = await db.comment.create({
      data: {
        articleId: article.id,
        name,
        content,
        approved: true,
      },
    })
    return NextResponse.json({ comment: toComment(created) })
  } catch (err) {
    console.error('[api/articles/[slug]/comments POST]', err)
    return NextResponse.json(
      { error: 'Publication impossible.' },
      { status: 500 },
    )
  }
}
