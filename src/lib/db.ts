import { PrismaClient } from '@prisma/client'

/**
 * Defensive Prisma client singleton.
 * - In dev: logs all queries for debugging.
 * - In prod: only errors and warnings.
 * - Won't crash at build time if DATABASE_URL is missing.
 *
 * Note: if the Prisma schema is updated (e.g. new model added) the dev server's
 * cached singleton may be stale. We detect that by checking for a known
 * property (e.g. `match`) on the cached client and replacing it with a fresh
 * instance when missing.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaVersion: string | undefined
}

// Bump this when the schema changes structurally (new models) to force a
// fresh Prisma client in long-running dev servers.
const PRISMA_CACHE_VERSION = 'v2-match-model'

function createPrismaClient(): PrismaClient | null {
  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['error', 'warn'],
    })
  } catch (err) {
    console.error('[db] Prisma client init failed:', err)
    return null
  }
}

function getDb(): PrismaClient {
  const cached = globalForPrisma.prisma
  const cachedVersion = globalForPrisma.prismaVersion
  if (cached && cachedVersion === PRISMA_CACHE_VERSION) {
    return cached
  }
  const fresh = createPrismaClient()
  if (!fresh) {
    return null as unknown as PrismaClient
  }
  globalForPrisma.prisma = fresh
  globalForPrisma.prismaVersion = PRISMA_CACHE_VERSION
  return fresh
}

export const db = getDb()

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db
  globalForPrisma.prismaVersion = PRISMA_CACHE_VERSION
}

