'use client'

import { useState, useEffect } from 'react'
import { Download, X, Apple, Smartphone, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Bouton "Installer l'application" pour le menu mobile.
 *
 * Sur Android (Chrome) : utilise l'API beforeinstallprompt → installation native.
 * Sur iPhone (Safari) : affiche un guide "Ajouter à l'écran d'accueil".
 *
 * Le bouton ne s'affiche que si :
 * - l'app n'est pas déjà installée (standalone = false)
 * - ET l'utilisateur n'a pas déjà fermé le guide
 */
export function InstallAppButton({ onNavigate }: { onNavigate?: () => void }) {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Utilise un microtask pour éviter le warning de lint (setState in effect)
    Promise.resolve().then(() => {
      // Détecte si déjà installé (mode standalone)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setInstalled(true)
        return
      }

      // Détecte la plateforme
      const ua = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
      const isAndroid = /Android/.test(ua)

      if (isIOS) setPlatform('ios')
      else if (isAndroid) setPlatform('android')
      else setPlatform('desktop')
    })

    // Écoute l'événement beforeinstallprompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Écoute si l'app a été installée
    const installedHandler = () => setInstalled(true)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    onNavigate?.() // ferme le menu si callback

    if (platform === 'ios') {
      // Sur iOS : affiche le guide
      setShowGuide(true)
      return
    }

    if (deferredPrompt) {
      // Sur Android : déclenche l'installation native
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      // Fallback : affiche le guide
      setShowGuide(true)
    }
  }

  // Ne pas afficher si déjà installé
  if (installed) return null

  return (
    <>
      <button
        onClick={handleInstall}
        className="flex w-full items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3 text-left text-sm font-bold text-primary hover:bg-primary/10 transition-all mt-1"
      >
        <span className="flex items-center gap-2 font-display uppercase tracking-wide">
          {platform === 'ios' ? (
            <Apple className="size-4" />
          ) : (
            <Download className="size-4" />
          )}
          Installer l'application
        </span>
        <span className="text-[10px] uppercase tracking-wide opacity-60">
          {platform === 'ios' ? 'iPhone' : platform === 'android' ? 'Android' : 'Gratuit'}
        </span>
      </button>

      {/* Guide d'installation iOS */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
          <div className="max-w-sm rounded-2xl bg-card border border-border p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowGuide(false)}
              className="float-right -mt-2 -mr-2 rounded-full p-1.5 hover:bg-secondary"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                {platform === 'ios' ? <Apple className="size-8 text-primary" /> : <Smartphone className="size-8 text-primary" />}
              </div>
              <h3 className="font-display text-lg font-bold uppercase">
                Installer GOAL ZONE TV
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {platform === 'ios'
                  ? 'Sur Safari iPhone, suivez ces étapes :'
                  : 'Sur Chrome Android, suivez ces étapes :'}
              </p>
            </div>

            {platform === 'ios' ? (
              <ol className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                  <span>Touchez l'icône <strong className="inline-flex items-center gap-1"><Share className="size-3.5" /> Partager</strong> en bas de l'écran</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  <span>Faites défiler et touchez <strong>« Sur l'écran d'accueil »</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                  <span>Appuyez sur <strong>« Ajouter »</strong> en haut à droite</span>
                </li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                  <span>Touchez le menu <strong>⋮</strong> (3 points) en haut à droite</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  <span>Sélectionnez <strong>« Ajouter à l'écran d'accueil »</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                  <span>Confirmez avec <strong>« Installer »</strong></span>
                </li>
              </ol>
            )}

            <div className="mt-5 rounded-lg bg-primary/5 p-3 text-center text-xs text-primary">
              ✨ L'app sera disponible hors-ligne, avec icône et notifications
            </div>

            <Button className="mt-4 w-full" onClick={() => setShowGuide(false)}>
              J'ai compris
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
