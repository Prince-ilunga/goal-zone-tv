import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthorized } from '@/lib/admin-auth'

// POST /api/feature-articles — marque les 3 articles les plus récents comme "à la une"
// Utile pour remplir le hero quand aucun article n'a featured=true
export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
    }

    // Récupère les 3 articles les plus récents
    const recent = await db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true },
    })

    if (recent.length === 0) {
      return NextResponse.json({ error: 'Aucun article à marquer.' }, { status: 404 })
    }

    // Marque ces 3 comme featured=true, les autres featured=false
    await db.article.updateMany({
      where: { featured: true },
      data: { featured: false },
    })

    const updated = []
    for (const a of recent) {
      const isFirst = a.id === recent[0].id
      await db.article.update({
        where: { id: a.id },
        data: {
          featured: true,
          // Le 1er article est aussi marqué breaking pour le bandeau "Dernière minute"
          breaking: isFirst,
        },
      })
      updated.push({ id: a.id, title: a.title, featured: true, breaking: isFirst })
    }

    return NextResponse.json({
      success: true,
      message: `${updated.length} articles marqués comme "à la une"`,
      articles: updated,
    })
  } catch (error) {
    console.error('[API feature-articles] error', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
