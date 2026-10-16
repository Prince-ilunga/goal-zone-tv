'use client'

import { Radio } from 'lucide-react'
import type { Article } from '@/lib/types'

export function LiveTicker({ articles }: { articles: Article[] }) {
  const breaking = articles.filter((a) => a.breaking)

  if (!breaking.length) return null

  // Duplicate list so marquee can scroll infinitely.
  const items = [...breaking, ...breaking]

  return (
    <div className="flex items-stretch border-y border-destructive/30 bg-destructive text-white">
      <div className="flex flex-shrink-0 items-center gap-2 bg-destructive px-3 py-2 sm:px-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        <Radio className="size-4" />
        <span className="text-xs font-bold uppercase tracking-wider sm:text-sm">
          Dernière minute
        </span>
      </div>
      <div
        className="relative flex flex-1 items-center overflow-hidden"
        aria-label="Fil d'actualité"
      >
        <div
          className="flex items-center gap-8 whitespace-nowrap py-2 animate-marquee"
          style={{ willChange: 'transform' }}
        >
          {items.map((a, i) => (
            <a
              key={`${a.id}-${i}`}
              href={`/articles/${a.slug}`}
              className="text-xs font-medium transition hover:underline sm:text-sm"
            >
              <span className="mr-2 text-white/70">›</span>
              {a.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
