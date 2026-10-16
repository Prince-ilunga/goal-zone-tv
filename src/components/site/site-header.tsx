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
import { Menu, Search, Lock, X, ChevronRight, MapPin } from 'lucide-react'
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
  const scope = useNewsStore((s) => s.scope)

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
              className="ml-auto md:hidden text-primary"
              aria-label="Ouvrir le menu"
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm border-l-0 p-0 flex flex-col">
            {/* En-tête bleu roi premium avec logo + nom */}
            <div className="bg-king-blue text-primary-foreground px-5 py-5 flex items-center gap-3 shrink-0">
              <img
                src="/logo.jpg"
                alt="GOAL ZONE TV"
                className="h-12 w-12 rounded-lg bg-white p-1 ring-1 ring-white/30"
              />
              <div className="flex-1 min-w-0">
                <SheetTitle className="font-display text-base font-extrabold uppercase tracking-tight text-primary-foreground truncate">
                  Goal Zone TV
                </SheetTitle>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
                  L'info sportive · Moïse Kalala
                </p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer"
                className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 inline-flex items-center justify-center transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Corps scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Recherche en haut (accès rapide) */}
              <form onSubmit={handleSearch} className="relative mb-5">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un article..."
                  className="h-11 rounded-xl border-border bg-secondary/50 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Recherche"
                />
              </form>

              {/* Section : Navigation */}
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Navigation
              </p>
              <nav className="flex flex-col gap-1 mb-5">
                {NAV_ITEMS.map((item) => {
                  const isActive = scope === item.scope
                  return (
                    <button
                      key={item.scope}
                      onClick={() => onNav(item.scope)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'text-foreground hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <span className="font-display uppercase tracking-wide">{item.label}</span>
                      <ChevronRight className={`size-4 transition-transform ${isActive ? 'translate-x-0' : '-translate-x-1 opacity-40'}`} />
                    </button>
                  )
                })}
              </nav>

              {/* Séparateur */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Plus</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* À propos */}
              <Link
                href="#apropos"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary transition-all mb-1"
              >
                <span className="font-display uppercase tracking-wide">À propos</span>
                <ChevronRight className="size-4 opacity-40" />
              </Link>

              {/* Rédaction — bouton premium avec cadenas */}
              <button
                onClick={() => {
                  openAdmin()
                  setMobileOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3 text-left text-sm font-bold text-primary hover:bg-primary/10 transition-all mt-1"
              >
                <span className="flex items-center gap-2 font-display uppercase tracking-wide">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                    <Lock className="size-3" />
                  </span>
                  Rédaction
                </span>
                <span className="text-[10px] uppercase tracking-wide opacity-60">Espace privé</span>
              </button>

              {/* Section : Suivez-nous */}
              <div className="mt-6">
                <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Suivez-nous
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(SOCIAL_LINKS).map((s) => {
                    const Icon = s.icon
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-secondary/40 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group"
                      >
                        <Icon className="size-5 transition-transform group-hover:scale-110" />
                        <span className="text-[9px] font-medium uppercase tracking-wide opacity-70 group-hover:opacity-100">
                          {s.short}
                        </span>
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer du menu : localisation */}
            <div className="shrink-0 border-t border-border bg-secondary/30 px-5 py-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="size-3 text-primary" />
              <span className="font-medium">Lubumbashi, Haut-Katanga — RDC</span>
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
