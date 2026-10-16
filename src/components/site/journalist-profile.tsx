import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenLine, Mic, Globe2, Trophy } from 'lucide-react'
import { CONTACT_INFO } from '@/lib/social'

export function JournalistProfile() {
  const stats = [
    { icon: PenLine, label: 'Années d\'expérience', value: '12+' },
    { icon: Mic, label: 'Interviews', value: '500+' },
    { icon: Globe2, label: 'Compétitions couvertes', value: '40+' },
    { icon: Trophy, label: 'Pays visités', value: '15' },
  ]

  return (
    <section id="apropos" className="mx-auto max-w-7xl px-4 py-12 scroll-mt-32">
      <header className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 px-3 py-1">
          À propos de la rédaction
        </Badge>
        <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
          Moïse Kalala
        </h2>
        <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Journaliste sportif — Lubumbashi, RDC
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Photo Moïse Kalala (telle quelle, sans altération de couleur) */}
        <Card className="overflow-hidden lg:row-span-2 border-0 shadow-xl">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
            {/* Photo originale, non modifiée */}
            <img
              src="/moise-kalala.jpg"
              alt="Moïse Kalala, journaliste sportif fondateur de GOAL ZONE TV"
              className="h-full w-full object-cover"
            />

            {/* Badge logo GOAL ZONE TV en haut à droite */}
            <div className="absolute top-3 right-3">
              <img
                src="/logo.jpg"
                alt="GOAL ZONE TV"
                className="h-12 w-12 rounded-lg bg-white p-1 shadow-lg ring-1 ring-white/50 object-contain"
              />
            </div>

            {/* Bandeau bleu roi avec nom + fonction en bas (par-dessus la photo sans l'altérer) */}
            <div className="absolute bottom-0 left-0 right-0 bg-king-blue/95 backdrop-blur-sm p-4">
              <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-tight">
                Moïse Kalala
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/85 inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                Journaliste sportif · Fondateur
              </p>
            </div>
          </div>
        </Card>

        {/* Bio */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <h3 className="font-display text-xl font-bold text-primary">
              Parcours & mission
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Moïse Kalala est journaliste sportif basé à Lubumbashi, dans la
              province du Haut-Katanga en République Démocratique du Congo.
              Depuis plus d&apos;une décennie, il couvre le football local
              (LINAFOOT, Ligue provinciale), les Léopards de la RDC, les
              compétitions continentales de la CAF, ainsi que les grands
              rendez-vous internationaux.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Fondateur de <strong className="text-foreground">GOAL ZONE TV</strong>,
              il s&apos;est donné pour mission de donner une voix à nos
              championnats, à nos athlètes et à nos supporters — avec rigueur,
              passion et indépendance. Basket, boxe, athlétisme : tous les
              sports congolais trouvent leur place ici.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="rounded-lg border bg-secondary/40 p-3 text-center"
                  >
                    <Icon className="mx-auto mb-1 size-5 text-primary" />
                    <p className="font-display text-xl font-bold text-primary">
                      {s.value}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Carte contact */}
        <Card className="bg-king-blue text-primary-foreground lg:col-span-2">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex-shrink-0">
              <img
                src="/logo.jpg"
                alt="GOAL ZONE TV"
                className="size-20 rounded-lg bg-white p-1"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold">
                GOAL ZONE TV
              </h3>
              <p className="text-sm text-primary-foreground/90">
                Contact : {CONTACT_INFO.email}
              </p>
              <p className="text-sm text-primary-foreground/90">
                WhatsApp : {CONTACT_INFO.whatsappInternational}
              </p>
              <p className="text-sm text-primary-foreground/90">
                Basé à : {CONTACT_INFO.location}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                {CONTACT_INFO.brand}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
