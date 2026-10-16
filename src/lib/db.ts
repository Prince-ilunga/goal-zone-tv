import { PrismaClient } from '@prisma/client'

/**
 * Defensive Prisma client singleton.
 * - In dev: logs all queries for debugging.
 * - In prod: only errors and warnings.
 * - Won't crash at build time if DATABASE_URL is missing.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient | null {
  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['query', 'error', 'warn'],
    })
  } catch (err) {
    console.error('[db] Prisma client init failed:', err)
    return null
  }
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient() ?? (null as unknown as PrismaClient)

if (process.env.NODE_ENV !== 'production' && db) {
  globalForPrisma.prisma = db
}
