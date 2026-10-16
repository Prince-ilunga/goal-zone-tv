import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CONTACT_INFO } from '@/lib/social'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité du site GOAL ZONE TV — données collectées, traitement, droits des utilisateurs.',
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground/90">
            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                1. Préambule
              </h2>
              <p>
                GOAL ZONE TV s&apos;engage à protéger la vie privée des
                utilisateurs de son site. La présente politique décrit les
                données collectées, leur traitement et les droits dont vous
                disposez.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                2. Données collectées
              </h2>
              <p>Nous collectons les données suivantes :</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  <strong>Newsletter</strong> : votre adresse e-mail (et
                  facultativement votre nom) lorsque vous vous inscrivez.
                </li>
                <li>
                  <strong>Commentaires</strong> : votre nom et le contenu de
                  votre commentaire lorsque vous publiez sur un article.
                </li>
                <li>
                  <strong>J&apos;aime</strong> : une empreinte anonyme (hash IP
                  + navigateur) servant à éviter les doubles votes. Cette
                  empreinte est irréversible.
                </li>
                <li>
                  <strong>Statistiques de consultation</strong> : nombre de
                  vues par article, agrégées et anonymes.
                </li>
                <li>
                  <strong>Données techniques</strong> : adresse IP, type de
                  navigateur, page consultée (anonymisées pour les likes).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                3. Finalités du traitement
              </h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  Vous envoyer la newsletter à laquelle vous vous êtes inscrit.
                </li>
                <li>
                  Permettre la publication et l&apos;affichage de vos
                  commentaires.
                </li>
                <li>
                  Compter les &laquo; J&apos;aime &raquo; par article de façon
                  unique.
                </li>
                <li>Mesurer l&apos;audience globale du site.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                4. Base légale
              </h2>
              <p>
                Le traitement de vos données repose sur votre consentement
                (inscription newsletter, publication de commentaire). Ce
                consentement peut être retiré à tout moment.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                5. Durée de conservation
              </h2>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  Abonnés newsletter : jusqu&apos;à votre désinscription.
                </li>
                <li>
                  Commentaires : conservés tant que l&apos;article est en ligne.
                </li>
                <li>Likes : tant que l&apos;article est publié.</li>
                <li>
                  Logs techniques : 90 jours maximum, anonymisés ensuite.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                6. Partage des données
              </h2>
              <p>
                GOAL ZONE TV ne vend, ne loue et ne partage pas vos données à
                des tiers commerciaux. Seuls nos prestataires techniques
                (hébergeur, service d&apos;envoi d&apos;e-mails éventuel) peuvent
                avoir accès aux données strictement nécessaires, dans le cadre
                de leurs missions et sous engagement de confidentialité.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                7. Vos droits
              </h2>
              <p>
                Conformément au droit congolais et aux bonnes pratiques
                internationales (RGPD-like), vous disposez des droits suivants :
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Droit d&apos;accès à vos données.</li>
                <li>Droit de rectification.</li>
                <li>Droit à l&apos;effacement (&laquo; droit à l&apos;oubli &raquo;).</li>
                <li>Droit de retirer votre consentement à tout moment.</li>
                <li>Droit d&apos;opposition au traitement.</li>
              </ul>
              <p>
                Pour exercer ces droits, écrivez à{' '}
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-primary underline"
                >
                  {CONTACT_INFO.email}
                </a>{' '}
                en précisant votre demande.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                8. Sécurité
              </h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles
                raisonnables pour protéger vos données (HTTPS, mots de passe
                hachés, accès restreint à la base de données). Aucune méthode de
                transmission sur Internet n&apos;est toutefois 100% sûre.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                9. Cookies
              </h2>
              <p>
                Le site utilise un stockage local (localStorage) pour mémoriser
                votre session administrateur et préférences de navigation. Aucun
                cookie publicitaire tiers n&apos;est déposé.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary">
                10. Contact
              </h2>
              <p>
                Pour toute question relative à la présente politique, contactez
                Moïse Kalala à <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary underline">{CONTACT_INFO.email}</a> ou au {CONTACT_INFO.whatsappInternational}.
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
