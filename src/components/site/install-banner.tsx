'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Apple, Share, Monitor, Check, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown'

/**
 * Bannière d'installation PWA pour TOUS les appareils.
 *
 * - Android (Chrome) : déclenche l'installation native via beforeinstallprompt
 * - iPhone (Safari) : guide pas-à-pas "Ajouter à l'écran d'accueil"
 * - Desktop (Chrome/Edge) : installation native ou guide
 *
 * La bannière s'affiche après 15s sur le site (si pas déjà installé).
 * L'utilisateur peut la fermer (mémorisé 7 jours en localStorage).
 */
export function InstallBanner() {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Détecte si déjà installé
    const checkInstalled = () => {
      return window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as unknown as { standalone?: boolean }).standalone === true
    }

    // Utilise un microtask pour éviter le warning de lint
    Promise.resolve().then(() => {
      if (checkInstalled()) {
        setInstalled(true)
        return
      }

      // Vérifie si l'utilisateur a fermé la bannière récemment (7 jours)
      const dismissed = localStorage.getItem('gztv-install-dismissed')
      if (dismissed) {
        const dismissedDate = parseInt(dismissed, 10)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (Date.now() - dismissedDate < sevenDays) return
      }

      // Détecte la plateforme
      const ua = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
      const isAndroid = /Android/i.test(ua)

      if (isIOS) setPlatform('ios')
      else if (isAndroid) setPlatform('android')
      else setPlatform('desktop')
    })

    // Écoute beforeinstallprompt (Android Chrome + Desktop Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Affiche la bannière dès que l'événement est capté
      Promise.resolve().then(() => setShowBanner(true))
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Écoute l'installation réussie
    const installedHandler = () => {
      setInstalled(true)
      setShowBanner(false)
    }
    window.addEventListener('appinstalled', installedHandler)

    // Sur iOS (pas de beforeinstallprompt), affiche la bannière après 15s
    const timer = setTimeout(() => {
      const isStandalone = checkInstalled()
      if (!isStandalone) {
        Promise.resolve().then(() => setShowBanner(true))
      }
    }, 15000)

    // Écoute l'événement custom du menu "Installer l'application"
    const showInstallHandler = async () => {
      if (deferredPrompt) {
        // Si on a beforeinstallprompt (Android/Chrome), déclenche l'install native
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          setInstalled(true)
        }
        setDeferredPrompt(null)
      } else {
        // Sinon affiche le guide
        setShowGuide(true)
        setShowBanner(false)
      }
    }
    window.addEventListener('gztv-show-install', showInstallHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
      window.removeEventListener('gztv-show-install', showInstallHandler)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    // Sur Android/Desktop avec beforeinstallprompt : installation native
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
        setShowBanner(false)
      }
      setDeferredPrompt(null)
      return
    }

    // Sur iPhone ou si pas de beforeinstallprompt : affiche le guide
    setShowGuide(true)
    setShowBanner(false)
  }

  const dismiss = () => {
    setShowBanner(false)
    localStorage.setItem('gztv-install-dismissed', String(Date.now()))
  }

  // Ne rien afficher si déjà installé
  if (installed) return null

  const platformLabel =
    platform === 'ios' ? 'iPhone'
    : platform === 'android' ? 'Android'
    : platform === 'desktop' ? 'Ordinateur'
    : 'Mobile'

  const PlatformIcon = platform === 'ios' ? Apple : platform === 'desktop' ? Monitor : Smartphone

  return (
    <>
      {/* Bannière flottante en bas */}
      {showBanner && !showGuide && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-2xl rounded-2xl border-2 border-primary/20 bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-3 sm:p-4">
              {/* Icône app */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <img src="/logo.jpg" alt="GOAL ZONE TV" className="h-10 w-10 rounded-lg object-contain" />
              </div>

              {/* Texte */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">
                  Installez GOAL ZONE TV
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Accédez aux actualités en un tap — même hors-ligne · {platformLabel}
                </p>
              </div>

              {/* Boutons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="bg-primary hover:bg-primary/90 font-display uppercase tracking-wide h-9 px-4"
                >
                  <Download className="size-4 mr-1" />
                  <span className="hidden sm:inline">Installer</span>
                  <span className="sm:hidden">OK</span>
                </Button>
                <button
                  onClick={dismiss}
                  aria-label="Fermer"
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal guide d'installation (toutes plateformes) */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="max-w-md w-full rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête bleu roi */}
            <div className="bg-king-blue text-primary-foreground px-5 py-4 relative">
              <button
                onClick={() => setShowGuide(false)}
                className="absolute right-3 top-3 rounded-full p-1.5 hover:bg-primary-foreground/15"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
              <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="" className="h-12 w-12 rounded-lg bg-white p-1" />
                <div>
                  <h2 className="font-display text-lg font-bold uppercase">
                    Installez l'application
                  </h2>
                  <p className="text-xs text-primary-foreground/80">
                    GOAL ZONE TV sur votre {platformLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* Avantages */}
              <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-primary/5 p-2">
                  <Bell className="mx-auto mb-1 size-4 text-primary" />
                  <p className="text-[10px] font-medium uppercase">Alertes</p>
                </div>
                <div className="rounded-lg bg-primary/5 p-2">
                  <Download className="mx-auto mb-1 size-4 text-primary" />
                  <p className="text-[10px] font-medium uppercase">Hors-ligne</p>
                </div>
                <div className="rounded-lg bg-primary/5 p-2">
                  <PlatformIcon className="mx-auto mb-1 size-4 text-primary" />
                  <p className="text-[10px] font-medium uppercase">1 tap</p>
                </div>
              </div>

              {/* Étapes selon la plateforme */}
              {platform === 'ios' ? (
                <div>
                  <p className="mb-3 text-center text-sm font-semibold text-muted-foreground">
                    📱 Sur Safari (iPhone/iPad) :
                  </p>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                      <div className="flex-1">
                        <p className="text-sm">Touchez l'icône <strong className="inline-flex items-center gap-1 text-primary"><Share className="size-3.5" /> Partager</strong> en bas de Safari</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                      <div className="flex-1">
                        <p className="text-sm">Faites défiler vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong></p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                      <div className="flex-1">
                        <p className="text-sm">Appuyez sur <strong>« Ajouter »</strong> en haut à droite</p>
                      </div>
                    </li>
                  </ol>
                </div>
              ) : platform === 'android' ? (
                <div>
                  <p className="mb-3 text-center text-sm font-semibold text-muted-foreground">
                    📱 Sur Chrome (Android) :
                  </p>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                      <p className="text-sm">Touchez le menu <strong>⋮</strong> (3 points) en haut à droite</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                      <p className="text-sm">Sélectionnez <strong>« Ajouter à l'écran d'accueil »</strong> ou <strong>« Installer l'application »</strong></p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                      <p className="text-sm">Confirmez avec <strong>« Installer »</strong></p>
                    </li>
                  </ol>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-center text-sm font-semibold text-muted-foreground">
                    💻 Sur Chrome / Edge (ordinateur) :
                  </p>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                      <p className="text-sm">Cliquez sur l'icône <strong className="inline-flex items-center gap-1"><Download className="size-3.5" /> Installer</strong> dans la barre d'adresse</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                      <p className="text-sm">Ou menu <strong>⋮</strong> → « Installer GOAL ZONE TV »</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                      <p className="text-sm">Confirmez l'installation</p>
                    </li>
                  </ol>
                </div>
              )}

              <div className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-center">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  ✅ Gratuit · Pas de mise à jour · Fonctionne hors-ligne
                </p>
              </div>

              <Button className="mt-4 w-full" onClick={() => setShowGuide(false)}>
                <Check className="size-4 mr-1" /> J'ai compris
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
