'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Menu, Search, Lock } from 'lucide-react'
import {
  SOCIAL_LINKS,
  CONTACT_INFO,
} from '@/lib/social'
import { useAdminStore } from '@/lib/admin-store'
import { useNewsStore } from '@/lib/news-store'

const NAV_ITEMS = [
  { label: 'Accueil', scope: 'ALL' as const },
  { label: 'Provincial', scope: 'PROVINCIAL' as const },
  { label: 'National', scope: 'NATIONAL' as const },
  { label: 'International', scope: 'INTERNATIONAL' as const },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const openAdmin = useAdminStore((s) => s.openAdmin)
  const setQuery = useNewsStore((s) => s.setQuery)
  const setScope = useNewsStore((s) => s.setScope)
  const query = useNewsStore((s) => s.query)

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const target = document.getElementById('newsroom')
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onNav = (scope: 'ALL' | 'PROVINCIAL' | 'NATIONAL' | 'INTERNATIONAL') => {
    setScope(scope)
    setMobileOpen(false)
    const target = document.getElementById('newsroom')
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background shadow-sm">
      {/* Barre bleue supérieure */}
      <div className="bg-king-blue text-primary-foreground text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline first-letter:uppercase">
              {today}
            </span>
            <span className="text-primary-foreground/70">|</span>
            <span className="font-medium">{CONTACT_INFO.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-primary-foreground/80 md:inline">
              Suivez-nous :
            </span>
            {Object.values(SOCIAL_LINKS).map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="rounded p-1 transition hover:bg-white/15"
                >
                  <Icon className="size-3.5" />
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bandeau logo + recherche desktop */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="GOAL ZONE TV"
            className="h-12 w-12 rounded-md object-cover ring-1 ring-primary/20"
            width={48}
            height={48}
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-extrabold uppercase tracking-tight text-king-navy sm:text-2xl">
              GOAL ZONE TV
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              L&apos;info sportive · Moïse Kalala
            </span>
          </div>
        </Link>

        <form
          onSubmit={handleSearch}
          className="ml-auto hidden items-center gap-2 md:flex"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-64 pl-9"
              aria-label="Recherche"
            />
          </div>
          <Button type="submit" className="bg-king-blue">
            <Search className="size-4" />
            <span className="sr-only">Rechercher</span>
          </Button>
        </form>

        {/* Mobile: hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetTitle className="font-display text-lg text-primary">
              Menu GOAL ZONE TV
            </SheetTitle>
            <nav className="mt-2 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.scope}
                  onClick={() => onNav(item.scope)}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium transition hover:bg-secondary"
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="#apropos"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium transition hover:bg-secondary"
              >
                À propos
              </Link>
              <button
                onClick={() => {
                  openAdmin()
                  setMobileOpen(false)
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition hover:bg-secondary"
              >
                <Lock className="size-4" /> Rédaction
              </button>
            </nav>
            <div className="mt-6">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-3"
                  aria-label="Recherche"
                />
              </form>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t pt-4">
              {Object.values(SOCIAL_LINKS).map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="rounded bg-secondary p-2 transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Nav horizontale bleu roi */}
      <nav className="bg-king-blue text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.scope}
              onClick={() => onNav(item.scope)}
              className="border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition hover:bg-white/10 hover:border-white"
            >
              {item.label}
            </button>
          ))}
          <Link
            href="#apropos"
            className="ml-auto hidden border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition hover:bg-white/10 hover:border-white sm:inline-block"
          >
            À propos
          </Link>
          <button
            onClick={openAdmin}
            className="flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition hover:bg-white/10 hover:border-white"
          >
            <Lock className="size-3.5" /> Rédaction
          </button>
        </div>
      </nav>
    </header>
  )
}
