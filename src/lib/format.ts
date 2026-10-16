import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Format a date as "il y a 2 heures" (French).
 * Gère correctement les dates stockées en UTC (sans suffixe Z) :
 * si la date n'a pas d'info de fuseau, on l'interprète comme UTC.
 */
export function timeAgo(date: string | Date): string {
  try {
    let d: Date
    if (typeof date === 'string') {
      // Si la date n'a pas de Z ni de offset, c'est du UTC "naif" → on ajoute Z
      const iso = date.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(date) ? date : date + 'Z'
      d = new Date(iso)
    } else {
      d = date
    }
    // Vérifie que la date est valide
    if (isNaN(d.getTime())) return ''
    return formatDistanceToNow(d, { addSuffix: true, locale: fr })
  } catch {
    return ''
  }
}

/**
 * Format a date as full French date — "12 mars 2024, 14:30".
 */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('fr-FR', {
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
