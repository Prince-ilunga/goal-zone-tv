import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/init-db — crée les tables dans la DB Neon si elles n'existent pas
// Utile sur Vercel où prisma db push ne s'exécute pas toujours automatiquement.
export async function POST() {
  const results: string[] = []

  // 1. Teste si la table Article existe déjà
  try {
    await db.article.count()
    results.push('✓ Table Article accessible')
  } catch {
    // La table n'existe pas → on tente de la créer via SQL brut
    results.push('⚠️ Table Article manquante, création en cours...')
    try {
      // Création des tables via SQL DDL (compatible PostgreSQL)
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Article" (
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
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug");
        CREATE INDEX IF NOT EXISTS "Article_scope_idx" ON "Article"("scope");
        CREATE INDEX IF NOT EXISTS "Article_sport_idx" ON "Article"("sport");
        CREATE INDEX IF NOT EXISTS "Article_published_idx" ON "Article"("published");
        CREATE INDEX IF NOT EXISTS "Article_createdAt_idx" ON "Article"("createdAt");
      `)
      results.push('✓ Table Article créée')
    } catch (e) {
      results.push(`✗ Erreur création Article: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 2. Table Subscriber
  try {
    await db.subscriber.count()
    results.push('✓ Table Subscriber accessible')
  } catch {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Subscriber" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Subscriber_email_key" UNIQUE ("email")
        );
      `)
      results.push('✓ Table Subscriber créée')
    } catch (e) {
      results.push(`✗ Erreur Subscriber: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 3. Table Like
  try {
    await db.like.count()
    results.push('✓ Table Like accessible')
  } catch {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Like" (
          "id" TEXT NOT NULL,
          "articleId" TEXT NOT NULL,
          "fingerprint" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Like_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Like_articleId_fingerprint_key" UNIQUE ("articleId", "fingerprint")
        );
        CREATE INDEX IF NOT EXISTS "Like_articleId_idx" ON "Like"("articleId");
      `)
      results.push('✓ Table Like créée')
    } catch (e) {
      results.push(`✗ Erreur Like: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 4. Table Comment
  try {
    await db.comment.count()
    results.push('✓ Table Comment accessible')
  } catch {
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Comment" (
          "id" TEXT NOT NULL,
          "articleId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "approved" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
        );
        CREATE INDEX IF NOT EXISTS "Comment_articleId_idx" ON "Comment"("articleId");
        CREATE INDEX IF NOT EXISTS "Comment_approved_idx" ON "Comment"("approved");
      `)
      results.push('✓ Table Comment créée')
    } catch (e) {
      results.push(`✗ Erreur Comment: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 5. Vérification finale
  let finalCount = 0
  try {
    finalCount = await db.article.count()
    results.push(`✓ Vérification finale : ${finalCount} article(s) en DB`)
  } catch (e) {
    results.push(`✗ Vérification finale échouée : ${e instanceof Error ? e.message : String(e)}`)
  }

  return NextResponse.json({
    success: finalCount >= 0,
    results,
    articlesCount: finalCount,
  })
}
