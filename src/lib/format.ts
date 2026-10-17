import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Fuseau horaire du site — Lubumbashi, RDC = CAT = UTC+2.
 * Toutes les dates affichées sont dans ce fuseau.
 */
const SITE_TIMEZONE_OFFSET = 2 * 60 * 60 * 1000 // +2h en ms

/**
 * Convertit une date stockée (potentiellement en UTC "naif" sans Z)
 * vers le fuseau Africa/Kinshasa (UTC+2) pour un affichage correct.
 */
function toSiteDate(date: string | Date): Date {
  let d: Date
  if (typeof date === 'string') {
    // Si la date n'a pas de Z ni d'offset, c'est du UTC "naif" → on ajoute Z
    const iso = date.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(date) ? date : date + 'Z'
    d = new Date(iso)
  } else {
    d = new Date(date.getTime())
  }
  return d
}

/**
 * Format a date as "il y a 2 heures" (French) dans le fuseau Africa/Kinshasa.
 *
 * Le problème résolu : le serveur Vercel tourne en UTC, mais les articles sont
 * publiés à Lubumbashi (UTC+2). Si on compare naïvement la date UTC stockée
 * avec `Date.now()` (aussi UTC), le résultat est correct. Mais parfois la DB
 * stocke la date en "naive" (sans Z), ce qui fait que le navigateur l'interprète
 * comme locale → décalage de 2h. On corrige en forçant l'interprétation UTC,
 * puis en calculant la distance dans le bon fuseau.
 */
export function timeAgo(date: string | Date): string {
  try {
    const d = toSiteDate(date)
    if (isNaN(d.getTime())) return ''

    // Calcul de la différence en tenant compte du fuseau du site
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()

    // Si la différence est négative (date future), on affiche "à l'instant"
    if (diffMs < 0) return 'à l\'instant'

    // Si moins de 60 secondes, "à l'instant"
    if (diffMs < 60_000) return 'à l\'instant'

    // Utilise formatDistanceToNow avec la date corrigée
    return formatDistanceToNow(d, { addSuffix: true, locale: fr })
  } catch {
    return ''
  }
}

/**
 * Format a date as full French date — "12 mars 2024, 14:30" dans le fuseau
 * Africa/Kinshasa (UTC+2).
 */
export function formatDate(date: string | Date): string {
  try {
    const d = toSiteDate(date)
    if (isNaN(d.getTime())) return ''

    // Convertit vers le fuseau du site (UTC+2) pour l'affichage
    const siteDate = new Date(d.getTime() + SITE_TIMEZONE_OFFSET)
    return siteDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

/**
 * Compact view count: 1234 → "1,2k", 1500000 → "1,5M".
 */
export function formatViews(n: number): string {
  if (n === null || n === undefined || isNaN(n)) return '0'
  if (n < 1000) return String(n)
  if (n < 1_000_000) {
    const v = n / 1000
    return `${v.toFixed(1).replace('.', ',')}k`
  }
  const v = n / 1_000_000
  return `${v.toFixed(1).replace('.', ',')}M`
}

/**
 * Generate an URL-friendly slug from a French title.
 */
export function slugify(input: string): string {
  if (!input) return ''
  const map: Record<string, string> = {
    à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a',
    ç: 'c',
    è: 'e', é: 'e', ê: 'e', ë: 'e',
    ì: 'i', í: 'i', î: 'i', ï: 'i',
    ñ: 'n',
    ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
    ù: 'u', ú: 'u', û: 'u', ü: 'u',
    ý: 'y', ÿ: 'y',
    '’': '-', '\'': '-', '‘': '-',
  }
  let s = input.toLowerCase().trim()
  for (const [from, to] of Object.entries(map)) {
    s = s.split(from).join(to)
  }
  s = s.replace(/[^a-z0-9\s-]/g, '')
  s = s.replace(/[\s_]+/g, '-')
  s = s.replace(/-+/g, '-')
  s = s.replace(/^-+|-+$/g, '')
  return s.slice(0, 80)
}

/**
 * Estimate reading time in minutes (≈ 220 wpm in French).
 */
export function estimateReadMinutes(text: string): number {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
