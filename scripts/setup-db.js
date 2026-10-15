/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Détecte le type de base de données selon DATABASE_URL et ajuste
 * automatiquement le provider dans prisma/schema.prisma.
 *
 * - SQLite (file:) → provider = "sqlite"
 * - PostgreSQL (postgresql://) → provider = "postgresql"
 * - MySQL (mysql://) → provider = "mysql"
 * - Aucune DATABASE_URL → garde sqlite (build de démonstration)
 *
 * Lancé automatiquement avant le build (prebuild) et après install (postinstall)
 * pour que Vercel utilise PostgreSQL si DATABASE_URL pointe vers Neon/Supabase.
 */
const fs = require('fs')
const path = require('path')

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
const dbUrl = process.env.DATABASE_URL || ''

function detectProvider(url) {
  if (!url) return 'sqlite'
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql'
  if (url.startsWith('mysql://')) return 'mysql'
  if (url.startsWith('file:')) return 'sqlite'
  return 'sqlite'
}

function main() {
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema introuvable:', schemaPath)
    process.exit(1)
  }

  const provider = detectProvider(dbUrl)
  let schema = fs.readFileSync(schemaPath, 'utf8')

  const newSchema = schema.replace(
    /provider\s*=\s*"(sqlite|postgresql|mysql)"/,
    `provider = "${provider}"`
  )

  if (newSchema !== schema) {
    fs.writeFileSync(schemaPath, newSchema)
    console.log(`✓ Prisma provider ajusté : "${provider}"`)
  } else {
    console.log(`✓ Prisma provider déjà OK : "${provider}"`)
  }

  if (!dbUrl) {
    console.warn('⚠️  DATABASE_URL manquante — build en mode démo (sans DB runtime)')
  } else {
    console.log(`✓ DATABASE_URL détectée (${dbUrl.slice(0, 30)}...)`)
  }
}

main()
