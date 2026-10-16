/**
 * Domain types and metadata for GOAL ZONE TV.
 */

export type Scope = 'PROVINCIAL' | 'NATIONAL' | 'INTERNATIONAL'
export type Sport = 'FOOTBALL' | 'BASKETBALL' | 'BOXE' | 'ATHLETISME' | 'AUTRE'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  scope: Scope
  sport: Sport
  imageUrl?: string | null
  imageAlt?: string | null
  videoUrl?: string | null
  featured: boolean
  breaking: boolean
  views: number
  readMinutes: number
  source?: string | null
  location?: string | null
  published: boolean
  createdAt: string
  updatedAt: string
  likesCount?: number
  commentsCount?: number
}

export interface SiteStats {
  followers: number
  articlesCount: number
  breakingCount?: number
}

export interface Comment {
  id: string
  articleId: string
  name: string
  content: string
  approved: boolean
  createdAt: string
}

export const SCOPE_META: Record<
  Scope,
  { label: string; short: string; color: string }
> = {
  PROVINCIAL: {
    label: 'Provincial',
    short: 'Prov.',
    color: 'bg-emerald-600 text-white',
  },
  NATIONAL: {
    label: 'National',
    short: 'Nat.',
    color: 'bg-king-blue text-white',
  },
  INTERNATIONAL: {
    label: 'International',
    short: 'Intl.',
    color: 'bg-amber-600 text-white',
  },
}

export const SPORT_META: Record<Sport, { label: string; emoji: string }> = {
  FOOTBALL: { label: 'Football', emoji: '⚽' },
  BASKETBALL: { label: 'Basketball', emoji: '🏀' },
  BOXE: { label: 'Boxe', emoji: '🥊' },
  ATHLETISME: { label: 'Athlétisme', emoji: '🏃' },
  AUTRE: { label: 'Autre', emoji: '🏅' },
}

export const SCOPES: Scope[] = ['PROVINCIAL', 'NATIONAL', 'INTERNATIONAL']
export const SPORTS: Sport[] = [
  'FOOTBALL',
  'BASKETBALL',
  'BOXE',
  'ATHLETISME',
  'AUTRE',
]
