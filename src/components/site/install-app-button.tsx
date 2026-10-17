'use client'

import { Download, Apple, Smartphone, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'

/**
 * Bouton "Installer l'application" pour le menu mobile.
 * Déclenche l'événement personnalisé 'gztv-show-install' que la bannière
 * globale (InstallBanner) écoute pour afficher le guide d'installation.
 */
export function InstallAppButton({ onNavigate }: { onNavigate?: () => void }) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown')
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    Promise.resolve().then(() => {
      // Détecte si déjà installé
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setInstalled(true)
        return
      }

      const ua = navigator.userAgent
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
      const isAndroid = /Android/i.test(ua)

      if (isIOS) setPlatform('ios')
      else if (isAndroid) setPlatform('android')
      else setPlatform('desktop')
    })
  }, [])

  if (installed) return null

  const handleClick = () => {
    onNavigate?.() // ferme le menu
    // Déclenche l'événement global pour ouvrir la bannière / guide
    window.dispatchEvent(new CustomEvent('gztv-show-install'))
  }

  const PlatformIcon = platform === 'ios' ? Apple : platform === 'desktop' ? Monitor : Smartphone
  const platformLabel =
    platform === 'ios' ? 'iPhone'
    : platform === 'android' ? 'Android'
    : platform === 'desktop' ? 'Ordinateur'
    : 'Mobile'

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3 text-left text-sm font-bold text-primary hover:bg-primary/10 transition-all mt-1"
    >
      <span className="flex items-center gap-2 font-display uppercase tracking-wide">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
          <Download className="size-3" />
        </span>
        Installer l'application
      </span>
      <span className="text-[10px] uppercase tracking-wide opacity-60">{platformLabel}</span>
    </button>
  )
}
