import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { SOCIAL_LINKS, CONTACT_INFO } from '@/lib/social'

const NAV_RUBRIQUES = [
  { label: 'Accueil', href: '/' },
  { label: 'Provincial', href: '/?scope=PROVINCIAL' },
  { label: 'National', href: '/?scope=NATIONAL' },
  { label: 'International', href: '/?scope=INTERNATIONAL' },
]

const RDC_AFRIQUE = [
  'LINAFOOT',
  'Coupe du Congo',
  'Super Coupe RDC',
  'Ligue Haut-Katanga',
  'CAF Champions League',
  'Coupe de la CAF',
  'CAN',
  'CHAN',
]

const EUROPE = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Ligue des Champions UEFA',
  'Europa League',
  'Ligue des Nations',
]

const RESTE_MONDE = [
  'Coupe du Monde FIFA',
  'Copa Libertadores',
  'Copa Sudamericana',
  'Brasileirão',
  'MLS',
  'Saudi Pro League',
  'Botola',
  'Ligue 1 Égypte',
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-king-blue-dark text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Branding */}
          <div className="col-span-2">
            <div className="mb-3 flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="GOAL ZONE TV"
                className="size-12 rounded-md bg-white p-1"
              />
              <div>
                <p className="font-display text-xl font-bold">GOAL ZONE TV</p>
                <p className="text-xs text-primary-foreground/70">
                  L&apos;info sportive de chez nous
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm text-primary-foreground/80">
              Média sportif indépendant fondé par Moïse Kalala, basé à
              Lubumbashi (Haut-Katanga, RDC). Football, basket, boxe,
              athlétisme — couverts avec passion et rigueur.
            </p>
            <div className="flex gap-2">
              {Object.values(SOCIAL_LINKS).map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Rubriques */}
          <div>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground/90">
              Rubriques
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV_RUBRIQUES.map((r) => (
                <li key={r.label}>
                  <Link
                    href={r.href}
                    className="text-primary-foreground/75 transition hover:text-white"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RDC & Afrique */}
          <div>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground/90">
              RDC &amp; Afrique
            </h3>
            <ul className="space-y-2 text-xs">
              {RDC_AFRIQUE.map((c) => (
                <li key={c} className="text-primary-foreground/75">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Europe */}
          <div>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground/90">
              Europe
            </h3>
            <ul className="space-y-2 text-xs">
              {EUROPE.map((c) => (
                <li key={c} className="text-primary-foreground/75">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reste du monde — bande */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground/90">
            Reste du monde
          </h3>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
            {RESTE_MONDE.map((c) => (
              <span key={c} className="text-primary-foreground/70">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Coordonnées */}
        <div className="mt-8 flex flex-col items-start gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs text-primary-foreground/80">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" /> {CONTACT_INFO.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" /> {CONTACT_INFO.whatsappInternational}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {CONTACT_INFO.location}
            </span>
          </div>
          <div className="flex gap-2">
            {Object.values(SOCIAL_LINKS).map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white hover:text-primary"
                >
                  <Icon className="size-3.5" />
                </a>
              )
            })}
          </div>
        </div>

        {/* Bas de page */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-primary-foreground/60 sm:flex-row">
          <p>
            © {year} GOAL ZONE TV — Tous droits réservés. Directeur de
            publication : Moïse Kalala.
          </p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="transition hover:text-white">
              Mentions légales
            </Link>
            <Link
              href="/politique-confidentialite"
              className="transition hover:text-white"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
