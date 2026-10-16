'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, User, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PushNotificationButton } from '@/components/site/push-notification-button'

export function Subscribe() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Adresse e-mail invalide')
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
      if (!res.ok) throw new Error(data.error || 'Erreur')
      toast.success('Inscription confirmée ! Merci de votre confiance.')
      setDone(true)
      setName('')
      setEmail('')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Inscription impossible.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-king-blue text-primary-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Newsletter GOAL ZONE TV
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/85">
          Recevez chaque matin le meilleur de l&apos;actualité sportive de
          Lubumbashi, de la RDC et du monde. Gratuit, sans spam.
        </p>

        {/* Bouton notifications push */}
        <div className="mt-4 flex justify-center">
          <div className="[&>button]:bg-white/10 [&>button]:text-white [&>button]:border-white/20 [&>button]:hover:bg-white/20">
            <PushNotificationButton />
          </div>
        </div>

        {done ? (
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-lg bg-white/10 px-4 py-4">
            <CheckCircle2 className="size-6" />
            <p className="text-sm font-medium">
              Merci ! Vous êtes bien inscrit. À très vite dans votre boîte mail.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-6 grid max-w-md gap-3 sm:grid-cols-2"
          >
            <div className="space-y-1.5 text-left">
              <Label htmlFor="sub-name" className="text-primary-foreground/90">
                Nom (optionnel)
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sub-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="bg-white pl-9 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="sub-email" className="text-primary-foreground/90">
                E-mail *
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="sub-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className="bg-white pl-9 text-foreground"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="col-span-full mt-2 bg-destructive text-white hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Inscription...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" /> Je m&apos;inscris
                </>
              )}
            </Button>
          </form>
        )}
        <p className="mt-3 text-xs text-primary-foreground/70">
          En vous inscrivant, vous acceptez de recevoir des e-mails de GOAL ZONE
          TV. Vous pouvez vous désabonner à tout moment.
        </p>
      </div>
    </section>
  )
}
