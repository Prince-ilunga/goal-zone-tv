'use client'

import { useState, useEffect } from 'react'
import { Mail, Bell, CheckCircle2, Loader2, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

/**
 * Bouton flottant + modal d'abonnement newsletter.
 * Le bouton apparaît après 5 secondes sur le site, en bas à droite.
 * Persistance : si déjà abonné (localStorage), le bouton ne réapparaît pas.
 */
export function SubscribeButton() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // Affiche le bouton après 5s (sauf si déjà abonné)
  useEffect(() => {
    const already = typeof window !== 'undefined' && localStorage.getItem('gztv-subscribed') === '1'
    if (already) return
    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Adresse e-mail invalide.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Échec de l\'abonnement.')
        return
      }
      setDone(true)
      localStorage.setItem('gztv-subscribed', '1')
      toast.success('Abonnement réussi ! Bienvenue dans la communauté GOAL ZONE TV.')
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-display font-semibold uppercase tracking-wide text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        aria-label="S'abonner à la newsletter"
      >
        <Bell className="h-4 w-4 animate-pulse-dot" />
        <span className="hidden sm:inline">S'abonner</span>
        <span className="sm:hidden">Abonnez-vous</span>
      </button>

      {/* Modal d'abonnement */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="max-w-md p-0 gap-0 overflow-hidden">
          {done ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold uppercase">Inscription confirmée !</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Merci de rejoindre la communauté GOAL ZONE TV. Vous recevrez bientôt nos actualités sportives directement dans votre boîte mail.
              </p>
              <Button className="mt-5 w-full" onClick={() => setOpen(false)}>
                Continuer la lecture
              </Button>
            </div>
          ) : (
            <>
              {/* Bandeau bleu roi */}
              <div className="bg-king-blue px-5 py-4 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <DialogTitle className="font-display text-lg font-bold uppercase">
                      Newsletter
                    </DialogTitle>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Fermer"
                    className="rounded-full p-1 hover:bg-primary-foreground/15"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <DialogDescription className="text-primary-foreground/80 text-xs mt-1">
                  Ne ratez aucune actu de Moïse Kalala
                </DialogDescription>
              </div>

              <form onSubmit={submit} className="space-y-3 p-5">
                <div className="space-y-1.5">
                  <label htmlFor="sub-name-fast" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nom <span className="opacity-60">(optionnel)</span>
                  </label>
                  <Input
                    id="sub-name-fast"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    maxLength={60}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sub-email-fast" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Adresse e-mail <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="sub-email-fast"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="h-10 pl-9"
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-display uppercase tracking-wide h-11"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Inscription...</>
                  ) : (
                    <>S'abonner gratuitement <ChevronRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> Résumé quotidien gratuit</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> Alertes breaking news</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> Désabonnement en 1 clic</li>
                </ul>
                <p className="text-[10px] text-center text-muted-foreground">
                  En vous abonnant, vous acceptez de recevoir nos e-mails.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
