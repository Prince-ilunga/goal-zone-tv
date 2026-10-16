import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/init-db — crée les tables dans la DB Neon si elles n'existent pas
// Compatible PostgreSQL (exécute chaque commande séparément car Prisma
// ne supporte pas plusieurs statements dans un seul $executeRawUnsafe).
export async function POST() {
  const results: string[] = []

  // Liste des commandes SQL séparées (une par exécution)
  const SQL_COMMANDS: { table: string; check: () => Promise<number>; queries: string[] }[] = [
    {
      table: 'Article',
      check: () => db.article.count(),
      queries: [
        `CREATE TABLE IF NOT EXISTS "Article" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "excerpt" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "scope" TEXT NOT NULL DEFAULT 'NATIONAL',
          "sport" TEXT NOT NULL DEFAULT 'FOOTBALL',
          "imageUrl" TEXT,
          "imageAlt" TEXT,
          "videoUrl" TEXT,
          "featured" BOOLEAN NOT NULL DEFAULT false,
          "breaking" BOOLEAN NOT NULL DEFAULT false,
          "views" INTEGER NOT NULL DEFAULT 0,
          "readMinutes" INTEGER NOT NULL DEFAULT 3,
          "source" TEXT,
          "location" TEXT,
          "published" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
        )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug")`,
        `CREATE INDEX IF NOT EXISTS "Article_scope_idx" ON "Article"("scope")`,
        `CREATE INDEX IF NOT EXISTS "Article_sport_idx" ON "Article"("sport")`,
        `CREATE INDEX IF NOT EXISTS "Article_published_idx" ON "Article"("published")`,
        `CREATE INDEX IF NOT EXISTS "Article_createdAt_idx" ON "Article"("createdAt")`,
      ],
    },
    {
      table: 'Subscriber',
      check: () => db.subscriber.count(),
      queries: [
        `CREATE TABLE IF NOT EXISTS "Subscriber" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Subscriber_email_key" UNIQUE ("email")
        )`,
      ],
    },
    {
      table: 'Like',
      check: () => db.like.count(),
      queries: [
        `CREATE TABLE IF NOT EXISTS "Like" (
          "id" TEXT NOT NULL,
          "articleId" TEXT NOT NULL,
          "fingerprint" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Like_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Like_articleId_fingerprint_key" UNIQUE ("articleId", "fingerprint")
        )`,
        `CREATE INDEX IF NOT EXISTS "Like_articleId_idx" ON "Like"("articleId")`,
      ],
    },
    {
      table: 'Comment',
      check: () => db.comment.count(),
      queries: [
        `CREATE TABLE IF NOT EXISTS "Comment" (
          "id" TEXT NOT NULL,
          "articleId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "approved" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
        )`,
        `CREATE INDEX IF NOT EXISTS "Comment_articleId_idx" ON "Comment"("articleId")`,
        `CREATE INDEX IF NOT EXISTS "Comment_approved_idx" ON "Comment"("approved")`,
      ],
    },
  ]

  for (const { table, check, queries } of SQL_COMMANDS) {
    try {
      await check()
      results.push(`✓ Table ${table} accessible`)
    } catch {
      results.push(`⚠️ Création table ${table}...`)
      let allOk = true
      for (const query of queries) {
        try {
          await db.$executeRawUnsafe(query)
        } catch (e) {
          allOk = false
          const msg = e instanceof Error ? e.message.split('\n')[0] : String(e)
          results.push(`  ✗ ${table}: ${msg}`)
        }
      }
      if (allOk) results.push(`✓ Table ${table} créée`)
    }
  }

  // Vérification finale
  let finalCount = -1
  try {
    finalCount = await db.article.count()
    results.push(`✓ Vérification : ${finalCount} article(s) en DB`)
  } catch (e) {
    results.push(`✗ Vérification échouée : ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`)
  }

  return NextResponse.json({
    success: finalCount >= 0,
    results,
    articlesCount: finalCount,
  })
}
