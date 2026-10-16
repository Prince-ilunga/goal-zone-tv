'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Share2, Link2, Facebook, Twitter, MessageCircle, Check } from 'lucide-react'
import { toast } from 'sonner'

export function ShareSite() {
  const [copied, setCopied] = useState(false)
  const shareUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://goalzonetv.cd'
  const shareText = 'Découvrez GOAL ZONE TV — l\'actualité sportive de la RDC et du monde !'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GOAL ZONE TV',
          text: shareText,
          url: shareUrl,
        })
        toast.success('Merci pour le partage !')
        return
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      }
    }
    // Fallback: copier le lien
    await copyLink()
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Lien copié dans le presse-papiers !')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Impossible de copier le lien.')
    }
  }

  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  const xShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Card className="overflow-hidden border-primary/30">
        <CardContent className="grid items-center gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Partagez GOAL ZONE TV
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Soutenez le sport congolais en partageant notre site avec vos
              proches, vos groupes WhatsApp et vos communautés. Chaque partage
              compte !
            </p>
            <Button
              onClick={handleShare}
              size="lg"
              className="mt-5 bg-king-blue hover:bg-primary/90"
            >
              <Share2 className="mr-2 size-4" /> Partager ce site
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ShareTile href={fbShare} label="Facebook" color="bg-[#1877F2]">
              <Facebook className="size-5" />
            </ShareTile>
            <ShareTile href={xShare} label="X / Twitter" color="bg-black">
              <Twitter className="size-5" />
            </ShareTile>
            <ShareTile href={waShare} label="WhatsApp" color="bg-[#25D366]">
              <MessageCircle className="size-5" />
            </ShareTile>
            <button
              onClick={copyLink}
              className="flex flex-col items-center gap-2 rounded-lg bg-secondary p-4 text-center transition hover:bg-primary hover:text-primary-foreground"
              aria-label="Copier le lien"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {copied ? <Check className="size-5" /> : <Link2 className="size-5" />}
              </div>
              <span className="text-xs font-medium">
                {copied ? 'Copié !' : 'Copier le lien'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function ShareTile({
  href,
  label,
  color,
  children,
}: {
  href: string
  label: string
  color: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 rounded-lg bg-secondary p-4 text-center transition hover:scale-105 hover:shadow-md"
      aria-label={`Partager sur ${label}`}
    >
      <div className={`flex size-10 items-center justify-center rounded-full text-white ${color}`}>
        {children}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </a>
  )
}
