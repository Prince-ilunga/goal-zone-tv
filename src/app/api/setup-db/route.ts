import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/setup-db — crée les tables une par une via des commandes SQL simples
// Contourne la limitation Prisma "multiple commands" en faisant UNE requête par table
// Syntaxe simplifiée sans CONSTRAINT nommées (qui causent l'erreur "multiple commands")
export async function GET() {
  const results: string[] = []

  // Table Article — syntaxe simplifiée
  const createArticle = `CREATE TABLE IF NOT EXISTS "Article" ("id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "excerpt" TEXT NOT NULL, "content" TEXT NOT NULL, "scope" TEXT NOT NULL DEFAULT 'NATIONAL', "sport" TEXT NOT NULL DEFAULT 'FOOTBALL', "imageUrl" TEXT, "imageAlt" TEXT, "videoUrl" TEXT, "featured" BOOLEAN NOT NULL DEFAULT false, "breaking" BOOLEAN NOT NULL DEFAULT false, "views" INTEGER NOT NULL DEFAULT 0, "readMinutes" INTEGER NOT NULL DEFAULT 3, "source" TEXT, "location" TEXT, "published" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, PRIMARY KEY ("id"))`

  const createSubscriber = `CREATE TABLE IF NOT EXISTS "Subscriber" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT, "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("id"), UNIQUE ("email"))`

  const createLike = `CREATE TABLE IF NOT EXISTS "Like" ("id" TEXT NOT NULL, "articleId" TEXT NOT NULL, "fingerprint" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("id"), UNIQUE ("articleId", "fingerprint"))`

  const createComment = `CREATE TABLE IF NOT EXISTS "Comment" ("id" TEXT NOT NULL, "articleId" TEXT NOT NULL, "name" TEXT NOT NULL, "content" TEXT NOT NULL, "approved" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("id"))`

  // Exécute chaque CREATE TABLE individuellement
  for (const [name, sql] of [
    ['Article', createArticle],
    ['Subscriber', createSubscriber],
    ['Like', createLike],
    ['Comment', createComment],
  ] as const) {
    try {
      await db.$executeRawUnsafe(sql)
      results.push(`✓ Table ${name} créée`)
    } catch (e) {
      const msg = e instanceof Error ? e.message.split('\n')[0] : String(e)
      // Si la table existe déjà, c'est OK
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        results.push(`✓ Table ${name} existe déjà`)
      } else {
        results.push(`⚠️ ${name}: ${msg}`)
      }
    }
  }

  // Vérification finale
  let finalCount = -1
  try {
    finalCount = await db.article.count()
    results.push(`✓ Article table OK : ${finalCount} article(s)`)
  } catch (e) {
    results.push(`✗ Vérification Article: ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`)
  }

  return NextResponse.json({
    success: finalCount >= 0,
    results,
    articlesCount: finalCount,
  })
}
