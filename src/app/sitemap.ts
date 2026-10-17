import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://goalzonetv.cd'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/scores`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    if (!db) return staticEntries
    const articles = await db.article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    })
    const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${BASE_URL}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    return [...staticEntries, ...articleEntries]
  } catch (err) {
    console.error('[sitemap]', err)
    return staticEntries
  }
}
