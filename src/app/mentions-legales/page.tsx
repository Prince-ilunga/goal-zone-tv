import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CONTACT_INFO } from '@/lib/social'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales du site GOAL ZONE TV — éditeur, hébergeur, propriété intellectuelle, droit applicable.',
  robots: { index: true, follow: true },
}

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Mentions légales
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground/90">
            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                1. Éditeur du site
              </h2>
              <p>
                Le site <strong>GOAL ZONE TV</strong> est édité par{' '}
                <strong>Moïse Kalala</strong>, journaliste sportif indépendant,
                domicilié à Lubumbashi, province du Haut-Katanga, en République
                Démocratique du Congo.
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Directeur de publication : Moïse Kalala</li>
                <li>E-mail : {CONTACT_INFO.email}</li>
                <li>WhatsApp : {CONTACT_INFO.whatsappInternational}</li>
                <li>Adresse : {CONTACT_INFO.location}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                2. Hébergement
              </h2>
              <p>
                Le site est hébergé par un prestataire d&apos;hébergement web
                professionnel conforme aux standards de l&apos;industrie. Les
                coordonnées de l&apos;hébergeur peuvent être obtenues sur demande
                adressée à {CONTACT_INFO.email}.
              </p>
              <p>
                En cas de contenu illicite signalé, l&apos;hébergeur applique les
                procédures de retrait prévues par la loi.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                3. Propriété intellectuelle
              </h2>
              <p>
                L&apos;ensemble des contenus présents sur ce site (textes,
                images, vidéos, logos, marques, etc.) est protégé par le droit
                d&apos;auteur et le droit de la propriété intellectuelle applicables
                en RDC et à l&apos;international.
              </p>
              <p>
                Sauf mention explicite contraire, la reproduction, représentation,
                diffusion ou exploitation, totale ou partielle, des contenus
                sans autorisation écrite préalable de Moïse Kalala est interdite
                et constitue une contrefaçon.
              </p>
              <p>
                Les marques citées (LINAFOOT, CAF, FIFA, Premier League, etc.)
                appartiennent à leurs propriétaires respectifs et ne sont
                mentionnées qu&apos;à titre informatif.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                4. Responsabilité éditoriale
              </h2>
              <p>
                GOAL ZONE TV s&apos;efforce de publier des informations exactes,
                vérifiées et actualisées. Toutefois, l&apos;éditeur ne saurait être
                tenu responsable des erreurs, omissions ou de l&apos;indisponibilité
                temporaire du site.
              </p>
              <p>
                Les opinions exprimées dans les articles n&apos;engagent que leur
                auteur et ne reflètent pas nécessairement celles des partenaires
                éventuels.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                5. Liens hypertextes
              </h2>
              <p>
                Le site peut contenir des liens vers des sites tiers. GOAL ZONE
                TV n&apos;exerce aucun contrôle sur ces sites et décline toute
                responsabilité quant à leur contenu.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                6. Droit applicable
              </h2>
              <p>
                Les présentes mentions légales sont régies par le droit de la
                République Démocratique du Congo. En cas de litige, les tribunaux
                congolais seront seuls compétents, sous réserve des règles de
                compétence d&apos;attribution.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                7. Contact
              </h2>
              <p>
                Pour toute question relative aux présentes mentions légales,
                vous pouvez contacter l&apos;éditeur à l&apos;adresse{' '}
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-primary underline"
                >
                  {CONTACT_INFO.email}
                </a>{' '}
                ou via WhatsApp au {CONTACT_INFO.whatsappInternational}.
              </p>
            </section>
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
