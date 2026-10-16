'use client'

import { useEffect } from 'react'

/**
 * Enregistre le service worker pour activer le mode PWA (offline + installable).
 * Ne fait rien en dev (évite les soucis de cache pendant le développement).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => {
          console.warn('[SW] Échec enregistrement:', err)
        })
    }

    // Attend que la page soit chargée pour ne pas ralentir le first paint
    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register)
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}
