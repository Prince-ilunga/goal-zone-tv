'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Eye,
  Clock,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  X,
  Send,
  Facebook,
  Twitter,
  MessageCircle as WhatsAppIcon,
  Link2,
  Check,
  Loader2,
} from 'lucide-react'
import {
  SCOPE_META,
  SPORT_META,
  type Article,
  type Comment,
} from '@/lib/types'
import { timeAgo, formatViews, formatDate } from '@/lib/format'
import { useArticleModal } from '@/lib/article-modal-store'

export function ArticleModal() {
  const { current, open, close } = useArticleModal()
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  useEffect(() => {
    if (!open || !current) return
    let cancelled = false
    async function load() {
      if (!current) return
      try {
        const [likeRes, commentsRes] = await Promise.all([
          fetch(`/api/articles/${current.slug}/like`, { cache: 'no-store' }),
          fetch(`/api/articles/${current.slug}/comments`, { cache: 'no-store' }),
        ])
        if (likeRes.ok) {
          const likeData = await likeRes.json()
          if (!cancelled) {
            setLikes(likeData.likesCount || 0)
            setLiked(!!likeData.liked)
          }
        }
        if (commentsRes.ok) {
          const c = await commentsRes.json()
          if (!cancelled) setComments(c.comments || [])
        }
      } catch {
        // silent
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, current])

  if (!current) return null

  const scope = SCOPE_META[current.scope]
  const sport = SPORT_META[current.sport]
  const isVideo = !!current.videoUrl
  const shareUrl =
    (typeof window !== 'undefined' ? window.location.origin : '') +
    `/articles/${current.slug}`

  const onLike = async () => {
    try {
      const res = await fetch(`/api/articles/${current.slug}/like`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLikes(data.likesCount || 0)
      setLiked(data.liked)
    } catch {
      toast.error('Action impossible pour le moment.')
    }
  }

  const onComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentName.trim() || !commentText.trim()) {
      toast.error('Veuillez renseigner votre nom et votre commentaire.')
      return
    }
    setCommentLoading(true)
    try {
      const res = await fetch(`/api/articles/${current.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: commentName.trim(),
          content: commentText.trim(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Erreur')
      }
      const data = await res.json()
      setComments([data.comment, ...comments])
      setCommentText('')
      toast.success('Merci ! Votre commentaire a été publié.')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Publication impossible.',
      )
    } finally {
      setCommentLoading(false)
    }
  }

  const onShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: current.title,
          text: current.excerpt,
          url: shareUrl,
        })
        return
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      }
    }
    onCopyLink()
  }

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setShareCopied(false), 2500)
    } catch {
      toast.error('Copie impossible.')
    }
  }

  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  const xShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(current.title)}&url=${encodeURIComponent(shareUrl)}`
  const waShare = `https://wa.me/?text=${encodeURIComponent(`${current.title} — ${shareUrl}`)}`

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[92vh] w-full max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b bg-card px-5 py-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={`${scope.color} border-0`}>{scope.label}</Badge>
            <Badge variant="secondary">{sport.emoji} {sport.label}</Badge>
            {current.breaking && (
              <Badge variant="destructive">Breaking</Badge>
            )}
            {isVideo && <Badge className="bg-black text-white">▶ Vidéo</Badge>}
          </div>
          <DialogTitle className="text-balance font-display text-2xl font-bold leading-tight text-primary sm:text-3xl">
            {current.title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            {current.excerpt}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-5 py-5">
            {/* Métadonnées */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {current.location || 'Lubumbashi, RDC'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatDate(current.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3.5" />
                {formatViews(current.views)} vues
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {current.readMinutes} min de lecture
              </span>
              {current.source && (
                <span className="rounded bg-secondary px-2 py-0.5">
                  Source : {current.source}
                </span>
              )}
            </div>

            {/* Média */}
            {(isVideo || current.imageUrl) && (
              <div className="mb-5 overflow-hidden rounded-lg bg-muted">
                {isVideo ? (
                  <video
                    src={current.videoUrl!}
                    poster={current.imageUrl || undefined}
                    controls
                    className="aspect-video w-full object-contain"
                  />
                ) : (
                  <img
                    src={current.imageUrl!}
                    alt={current.imageAlt || current.title}
                    className="aspect-video w-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Contenu */}
            <article className="prose prose-sm max-w-none">
              {current.content.split('\n').map((para, i) =>
                para.trim() ? (
                  <p key={i} className="mb-3 leading-relaxed text-foreground/90">
                    {para}
                  </p>
                ) : null,
              )}
            </article>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-y py-3">
              <Button
                onClick={onLike}
                variant={liked ? 'default' : 'outline'}
                className={liked ? 'bg-destructive text-white' : ''}
              >
                <Heart
                  className={`mr-1.5 size-4 ${liked ? 'fill-current' : ''}`}
                />
                {formatViews(likes)} J&apos;aime
              </Button>
              <Button
                onClick={onShareNative}
                variant="outline"
              >
                <Share2 className="mr-1.5 size-4" /> Partager
              </Button>
              <div className="ml-auto flex items-center gap-1.5">
                <a
                  href={fbShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:opacity-90"
                  aria-label="Partager sur Facebook"
                >
                  <Facebook className="size-4" />
                </a>
                <a
                  href={xShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-black text-white transition hover:opacity-90"
                  aria-label="Partager sur X"
                >
                  <Twitter className="size-4" />
                </a>
                <a
                  href={waShare}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:opacity-90"
                  aria-label="Partager sur WhatsApp"
                >
                  <WhatsAppIcon className="size-4" />
                </a>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onCopyLink}
                  aria-label="Copier le lien"
                >
                  {shareCopied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                </Button>
              </div>
            </div>

            {/* Commentaires */}
            <section className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-primary">
                <MessageCircle className="size-5" />
                Commentaires ({comments.length})
              </h3>

              <form onSubmit={onComment} className="mb-4 space-y-2">
                <Input
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Votre nom (ou pseudo)"
                  maxLength={50}
                  aria-label="Votre nom"
                />
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Écrivez votre commentaire..."
                  rows={3}
                  maxLength={1000}
                  aria-label="Votre commentaire"
                />
                <Button
                  type="submit"
                  disabled={commentLoading}
                  className="bg-king-blue"
                >
                  {commentLoading ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-1 size-4" />
                  )}
                  Publier
                </Button>
              </form>

              {comments.length === 0 ? (
                <p className="rounded-md bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
                  Aucun commentaire pour le moment. Soyez le premier !
                </p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-md border bg-card p-3"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          · {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/85">{c.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </ScrollArea>

        <Button
          onClick={close}
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </Button>
      </DialogContent>
    </Dialog>
  )
}
