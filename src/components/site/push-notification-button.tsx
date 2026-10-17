'use client'

import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

/**
 * Bouton d'abonnement aux notifications push (native browser).
 * Utilise l'API Notification du navigateur (gratuit, sans VAPID).
 */
export function PushNotificationButton() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    // Utilise un microtask pour éviter le warning de lint
    Promise.resolve().then(() => {
      setSupported(true)
      setPermission(Notification.permission)
    })
  }, [])

  const subscribe = async () => {
    if (!supported) {
      toast.info('Notifications non supportées sur cet appareil.')
      return
    }
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm === 'granted') {
      new Notification('GOAL ZONE TV', {
        body: '🔔 Vous recevrez les alertes breaking news en temps réel !',
        icon: '/icon-192.png',
      })
      localStorage.setItem('gztv-push', 'granted')
      toast.success('Notifications activées ! Vous recevrez les breaking news.')
    } else {
      toast.info('Notifications refusées. Réactivables dans les paramètres du navigateur.')
    }
  }

  if (!supported) return null

  if (permission === 'granted') {
    return (
      <Button variant="outline" size="sm" disabled className="border-emerald-500/30 text-emerald-600">
        <Check className="h-4 w-4 mr-1" /> Notifications activées
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={subscribe} className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
      <Bell className="h-4 w-4 mr-1" /> Activer les alertes
    </Button>
  )
}
