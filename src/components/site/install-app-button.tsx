'use client'

import { Download } from 'lucide-react'

/**
 * Bouton "Installer l'application" pour le menu mobile.
 * Toujours visible — au clic, déclenche l'événement 'gztv-show-install'
 * que la bannière globale (InstallBanner) écoute pour afficher le guide.
 */
export function InstallAppButton({ onNavigate }: { onNavigate?: () => void }) {
  const handleClick = () => {
    onNavigate?.() // ferme le menu
    // Déclenche l'événement global pour ouvrir la bannière / guide
    window.dispatchEvent(new CustomEvent('gztv-show-install'))
  }

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
      <span className="text-[10px] uppercase tracking-wide opacity-60">Gratuit</span>
    </button>
  )
}
