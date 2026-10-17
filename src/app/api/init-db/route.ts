import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/init-db — crée les tables dans la DB Neon si elles n'existent pas
// Chaque CREATE TABLE est exécuté individuellement (Prisma ne supporte pas
// les multi-statements dans $executeRawUnsafe).
export async function POST() {
  const results: string[] = []

  // Pour chaque table : tente count() d'abord, si erreur → CREATE TABLE
  const tables: { name: string; create: string; check: () => Promise<number> }[] = [
    {
      name: 'Article',
      create: `CREATE TABLE IF NOT EXISTS "Article" (
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
      check: () => db.article.count(),
    },
    {
      name: 'Subscriber',
      create: `CREATE TABLE IF NOT EXISTS "Subscriber" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Subscriber_email_key" UNIQUE ("email")
      )`,
      check: () => db.subscriber.count(),
    },
    {
      name: 'Like',
      create: `CREATE TABLE IF NOT EXISTS "Like" (
        "id" TEXT NOT NULL,
        "articleId" TEXT NOT NULL,
        "fingerprint" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Like_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Like_articleId_fingerprint_key" UNIQUE ("articleId", "fingerprint")
      )`,
      check: () => db.like.count(),
    },
    {
      name: 'Comment',
      create: `CREATE TABLE IF NOT EXISTS "Comment" (
        "id" TEXT NOT NULL,
        "articleId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "approved" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
      )`,
      check: () => db.comment.count(),
    },
    {
      name: 'Match',
      create: `CREATE TABLE IF NOT EXISTS "Match" (
        "id" TEXT NOT NULL,
        "competition" TEXT NOT NULL,
        "homeTeam" TEXT NOT NULL,
        "awayTeam" TEXT NOT NULL,
        "homeScore" INTEGER NOT NULL DEFAULT 0,
        "awayScore" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'upcoming',
        "minute" TEXT NOT NULL DEFAULT '',
        "matchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
      )`,
      check: () => db.match.count(),
    },
  ]

  for (const { name, create, check } of tables) {
    // 1. Teste si la table existe
    let exists = false
    try {
      await check()
      exists = true
    } catch {
      exists = false
    }

    if (exists) {
      results.push(`✓ ${name} : table accessible`)
      continue
    }

    // 2. Crée la table avec une seule commande SQL
    try {
      await db.$executeRawUnsafe(create)
      results.push(`✓ ${name} : table créée`)
    } catch (e) {
      const msg = e instanceof Error ? e.message.split('\n')[0] : String(e)
      results.push(`✗ ${name} : ${msg}`)
    }
  }

  // 3. Crée les index séparément (un par un, ignore les erreurs si existent)
  const indexes = [
    `CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug")`,
    `CREATE INDEX IF NOT EXISTS "Article_scope_idx" ON "Article"("scope")`,
    `CREATE INDEX IF NOT EXISTS "Article_sport_idx" ON "Article"("sport")`,
    `CREATE INDEX IF NOT EXISTS "Article_published_idx" ON "Article"("published")`,
    `CREATE INDEX IF NOT EXISTS "Article_createdAt_idx" ON "Article"("createdAt")`,
    `CREATE INDEX IF NOT EXISTS "Like_articleId_idx" ON "Like"("articleId")`,
    `CREATE INDEX IF NOT EXISTS "Comment_articleId_idx" ON "Comment"("articleId")`,
    `CREATE INDEX IF NOT EXISTS "Comment_approved_idx" ON "Comment"("approved")`,
    `CREATE INDEX IF NOT EXISTS "Match_competition_idx" ON "Match"("competition")`,
    `CREATE INDEX IF NOT EXISTS "Match_status_idx" ON "Match"("status")`,
  ]
  let indexCount = 0
  for (const idx of indexes) {
    try {
      await db.$executeRawUnsafe(idx)
      indexCount++
    } catch {
      // ignore (index existe déjà ou table manquante)
    }
  }
  results.push(`✓ ${indexCount} index créés/vérifiés`)

  // 4. Vérification finale
  let finalCount = -1
  try {
    finalCount = await db.article.count()
    results.push(`✓ Vérification : ${finalCount} article(s) en DB`)
  } catch (e) {
    results.push(`✗ Vérification : ${e instanceof Error ? e.message.split('\n')[0] : String(e)}`)
  }

  return NextResponse.json({
    success: finalCount >= 0,
    results,
    articlesCount: finalCount,
  })
}
