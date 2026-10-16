import { Newspaper, Users, Flame, Trophy } from 'lucide-react'
import type { SiteStats } from '@/lib/types'

interface StatsBarProps {
  stats: SiteStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    {
      icon: Newspaper,
      value: stats.articlesCount,
      label: 'Articles publiés',
    },
    {
      icon: Users,
      value: stats.followers,
      label: 'Abonnés',
    },
    {
      icon: Flame,
      value: stats.breakingCount ?? 0,
      label: 'Alertes breaking',
    },
    {
      icon: Trophy,
      value: 12,
      label: 'Compétitions suivies',
    },
  ]

  return (
    <section className="bg-king-blue text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4 sm:gap-6">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <div
              key={it.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Icon className="size-7 opacity-90" />
              <span className="font-display text-3xl font-bold sm:text-4xl">
                {it.value.toLocaleString('fr-FR')}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-primary-foreground/80 sm:text-xs">
                {it.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
