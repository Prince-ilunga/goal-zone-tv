'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Lock,
  LogOut,
  Loader2,
  Send,
  Trash2,
  Upload,
  Image as ImageIcon,
  Film,
  Sparkles,
  Link as LinkIcon,
  Newspaper,
  Download,
  Save,
} from 'lucide-react'
import { SCOPES, SPORTS, SCOPE_META, SPORT_META, type Article, type Scope, type Sport } from '@/lib/types'
import { slugify, formatDate, estimateReadMinutes } from '@/lib/format'

interface AdminPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TOKEN_KEY = 'gztv-token'
const DRAFT_KEY = 'gztv-draft-v1'

const DRAFT_DEFAULT = {
  title: '',
  excerpt: '',
  content: '',
  scope: 'NATIONAL' as Scope,
  sport: 'FOOTBALL' as Sport,
  location: '',
  imageUrl: '',
  videoUrl: '',
  featured: false,
  breaking: false,
  source: '',
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [draft, setDraft] = useState(DRAFT_DEFAULT)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [listLoading, setListLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Restore token + draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) setToken(t)
    const d = localStorage.getItem(DRAFT_KEY)
    if (d) {
      try {
        setDraft({ ...DRAFT_DEFAULT, ...JSON.parse(d) })
      } catch {
        // ignore
      }
    }
  }, [])

  // Persist draft whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }, 400)
    return () => clearTimeout(t)
  }, [draft])

  // Fetch articles when token becomes available
  useEffect(() => {
    if (token && open) fetchArticles()
  }, [token, open])

  const authHeaders = () => ({
    'x-admin-token': token || '',
  })

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      toast.error('Veuillez saisir le mot de passe.')
      return
    }
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec de connexion')
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setPassword('')
      toast.success('Bienvenue, Moïse ! Accès rédaction accordé.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Connexion impossible.')
    } finally {
      setLoginLoading(false)
    }
  }

  const onLogout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setArticles([])
    toast.info('Déconnexion réussie.')
  }

  const fetchArticles = async () => {
    setListLoading(true)
    try {
      const res = await fetch('/api/admin-articles', {
        headers: authHeaders(),
        cache: 'no-store',
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setArticles(data.articles || [])
    } catch {
      toast.error('Impossible de charger vos articles.')
    } finally {
      setListLoading(false)
    }
  }

  const onUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload échoué')
      // L'API retourne mediaUrl (pas url) — support des 2 pour compatibilité
      const mediaUrl = data.mediaUrl || data.url
      if (!mediaUrl) throw new Error('URL du média manquante dans la réponse')
      if (type === 'image') {
        setDraft((d) => ({ ...d, imageUrl: mediaUrl }))
        toast.success(`Image importée (${data.storage === 'cloudinary' ? 'Cloudinary' : 'local'}).`)
      } else {
        setDraft((d) => ({ ...d, videoUrl: mediaUrl }))
        toast.success(`Vidéo importée (${data.storage === 'cloudinary' ? 'Cloudinary' : 'local'}).`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload impossible.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  // Téléchargement d'un média (image ou vidéo) vers la galerie / dossier Téléchargements
  const downloadMedia = async (url: string, alt: string, isVideo: boolean) => {
    if (!url) return
    const baseName = (alt || 'goal-zone-tv').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || (isVideo ? 'video' : 'image')
    const ext = isVideo ? 'mp4' : 'png'
    const fileName = `${baseName}-${Date.now()}.${ext}`
    toast.info(isVideo ? 'Téléchargement de la vidéo...' : "Téléchargement de l'image...")

    // Méthode 1 : fetch + blob + <a download> (marche sur Chrome desktop + mobile récent)
    try {
      const fullUrl = url.startsWith('http') ? url : window.location.origin + url
      const res = await fetch(fullUrl)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = fileName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
      toast.success(
        isVideo
          ? 'Vidéo téléchargée. 📥 Vérifiez votre dossier Téléchargements / galerie.'
          : 'Image téléchargée. 📥 Vérifiez votre dossier Téléchargements / galerie.'
      )
    } catch {
      // Méthode 2 (fallback mobile) : ouvrir l'URL dans un nouvel onglet
      // L'utilisateur fait un appui long > "Enregistrer l'image/vidéo"
      const fullUrl = url.startsWith('http') ? url : window.location.origin + url
      window.open(fullUrl, '_blank')
      toast.info(
        isVideo
          ? 'Ouvrez la vidéo dans le nouvel onglet, appui long > Enregistrer la vidéo.'
          : "Ouvrez l'image dans le nouvel onglet, appui long > Enregistrer l'image.",
        { duration: 6000 }
      )
    }
  }

  const onGenerate = async () => {
    if (!draft.title) {
      toast.error('Saisissez un titre avant de générer une image IA.')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Illustration journalistique pour un article de sport intitulé : "${draft.title}". Style photo éditorial, scène dynamique, haute qualité.`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Génération échouée')
      // L'API generate-image retourne imageUrl (pas url)
      const mediaUrl = data.imageUrl || data.mediaUrl || data.url
      if (!mediaUrl) throw new Error('URL image manquante')
      setDraft((d) => ({ ...d, imageUrl: mediaUrl }))
      toast.success('Image IA générée avec succès !')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Génération impossible.')
    } finally {
      setGenerating(false)
    }
  }

  const onPublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title || !draft.excerpt || !draft.content) {
      toast.error('Titre, chapô et contenu sont obligatoires.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          readMinutes: estimateReadMinutes(draft.content),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publication échouée')
      toast.success('Article publié avec succès !')
      setDraft(DRAFT_DEFAULT)
      localStorage.removeItem(DRAFT_KEY)
      fetchArticles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publication impossible.')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Supprimer cet article définitivement ?')) return
    try {
      const res = await fetch(`/api/articles?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error()
      setArticles(articles.filter((a) => a.id !== id))
      toast.success('Article supprimé.')
    } catch {
      toast.error('Suppression impossible.')
    }
  }

  const downloadUrl = (url: string | null | undefined) => {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = url.split('/').pop() || 'media'
    a.click()
  }

  // Block dialog close while saving/uploading
  const blockClose = (e: Event) => {
    if (saving || uploading) e.preventDefault()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] w-full max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl flex flex-col"
        onPointerDownOutside={blockClose}
        onInteractOutside={blockClose}
        onEscapeKeyDown={blockClose}
      >
        <DialogHeader className="border-b bg-king-blue text-primary-foreground px-5 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Lock className="size-5" /> Espace rédaction — GOAL ZONE TV
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            {token
              ? 'Gérez vos articles : publier, lister, supprimer.'
              : 'Accès réservé à Moïse Kalala. Saisissez votre mot de passe.'}
          </DialogDescription>
        </DialogHeader>

        {!token ? (
          /* ----- LOGIN ----- */
          <form onSubmit={onLogin} className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="admin-pwd">Mot de passe</Label>
              <Input
                id="admin-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-king-blue"
            >
              {loginLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Lock className="mr-2 size-4" />
              )}
              Se connecter
            </Button>
            <p className="text-xs text-muted-foreground">
              Astuce : raccourci clavier <kbd className="rounded bg-secondary px-1.5 py-0.5">Ctrl + Shift + E</kbd> pour ouvrir/fermer ce panneau.
            </p>
          </form>
        ) : (
          /* ----- TABS ----- */
          <Tabs defaultValue="publish" className="flex w-full min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between border-b px-3">
              <TabsList className="bg-transparent">
                <TabsTrigger value="publish">
                  <Newspaper className="mr-1.5 size-4" /> Publier
                </TabsTrigger>
                <TabsTrigger value="list">
                  Mes articles ({articles.length})
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="mr-1 size-3.5" /> Déconnexion
              </Button>
            </div>

            {/* ----- PUBLISH TAB ----- */}
            <TabsContent value="publish" className="m-0 min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <form onSubmit={onPublish} className="space-y-4 p-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="Ex: TP Mazembe s'impose 3-1 face à Lupopo"
                      maxLength={160}
                    />
                    {draft.title && (
                      <p className="text-xs text-muted-foreground">
                        Slug :{' '}
                        <code className="rounded bg-secondary px-1 py-0.5">
                          /articles/{slugify(draft.title)}
                        </code>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="excerpt">Chapô *</Label>
                    <Textarea
                      id="excerpt"
                      value={draft.excerpt}
                      onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                      placeholder="Résumé court qui apparaîtra dans les cartes (2-3 phrases)."
                      rows={3}
                      maxLength={400}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="scope">Portée</Label>
                      <Select
                        value={draft.scope}
                        onValueChange={(v) => setDraft({ ...draft, scope: v as Scope })}
                      >
                        <SelectTrigger id="scope">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCOPES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {SCOPE_META[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sport">Discipline</Label>
                      <Select
                        value={draft.sport}
                        onValueChange={(v) => setDraft({ ...draft, sport: v as Sport })}
                      >
                        <SelectTrigger id="sport">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORTS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {SPORT_META[s].emoji} {SPORT_META[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Lieu</Label>
                      <Input
                        id="location"
                        value={draft.location}
                        onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                        placeholder="Lubumbashi, Kinshasa, Le Caire..."
                        maxLength={80}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="source">Source (optionnel)</Label>
                      <Input
                        id="source"
                        value={draft.source}
                        onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                        placeholder="AFP, CAF, LINAFOOT..."
                        maxLength={80}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="content">Contenu *</Label>
                    <Textarea
                      id="content"
                      value={draft.content}
                      onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                      placeholder="Rédigez votre article ici. Séparez les paragraphes par des sauts de ligne."
                      rows={8}
                      maxLength={15000}
                    />
                    <p className="text-xs text-muted-foreground">
                      ≈ {estimateReadMinutes(draft.content)} min de lecture ·{' '}
                      {draft.content.split(/\s+/).filter(Boolean).length} mots
                    </p>
                  </div>

                  {/* Médias */}
                  <div className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="size-4 text-primary" />
                      <span className="text-sm font-semibold">Image à la une</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => onUpload(e, 'image')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="mr-1 size-3.5 animate-spin" />
                        ) : (
                          <Upload className="mr-1 size-3.5" />
                        )}
                        Importer image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onGenerate}
                        disabled={generating}
                      >
                        {generating ? (
                          <Loader2 className="mr-1 size-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="mr-1 size-3.5" />
                        )}
                        Générer IA
                      </Button>
                      <div className="relative flex-1 min-w-[200px]">
                        <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={draft.imageUrl}
                          onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                          placeholder="https://... (URL image)"
                          className="h-9 pl-8 text-xs"
                        />
                      </div>
                    </div>
                    {draft.imageUrl && (
                      <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-md bg-muted">
                        <img
                          src={draft.imageUrl}
                          alt="Aperçu"
                          className="h-full w-full object-cover"
                        />
                        {/* Bouton télécharger l'image vers la galerie */}
                        <button
                          type="button"
                          onClick={() => downloadMedia(draft.imageUrl, draft.title || 'image-goal-zone-tv', false)}
                          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow-lg hover:bg-primary/90"
                          title="Télécharger l'image dans ma galerie"
                        >
                          <Download className="size-3.5" />
                          Télécharger
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <Film className="size-4 text-primary" />
                      <span className="text-sm font-semibold">Vidéo (optionnel)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => onUpload(e, 'video')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="mr-1 size-3.5 animate-spin" />
                        ) : (
                          <Upload className="mr-1 size-3.5" />
                        )}
                        Importer vidéo
                      </Button>
                      <div className="relative flex-1 min-w-[200px]">
                        <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={draft.videoUrl}
                          onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
                          placeholder="https://... (URL vidéo MP4)"
                          className="h-9 pl-8 text-xs"
                        />
                      </div>
                    </div>
                    {draft.videoUrl && (
                      <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-md bg-black">
                        <video
                          src={draft.videoUrl}
                          controls
                          className="h-full w-full object-contain"
                        />
                        {/* Bouton télécharger la vidéo vers la galerie */}
                        <button
                          type="button"
                          onClick={() => downloadMedia(draft.videoUrl, draft.title || 'video-goal-zone-tv', true)}
                          className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow-lg hover:bg-primary/90"
                          title="Télécharger la vidéo dans ma galerie"
                        >
                          <Download className="size-3.5" />
                          Télécharger vidéo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="flex flex-wrap items-center gap-4 rounded-md border p-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={draft.featured}
                        onCheckedChange={(v) => setDraft({ ...draft, featured: !!v })}
                      />
                      <span>⭐ Article à la une</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={draft.breaking}
                        onCheckedChange={(v) => setDraft({ ...draft, breaking: !!v })}
                      />
                      <span>🔥 Breaking news</span>
                    </label>
                  </div>
                </form>

              <DialogFooter className="border-t p-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
                    toast.success('Brouillon sauvegardé localement.')
                  }}
                >
                  <Save className="mr-1 size-4" /> Brouillon
                </Button>
                <Button
                  type="submit"
                  onClick={onPublish}
                  disabled={saving || uploading}
                  className="bg-king-blue"
                >
                  {saving ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-1 size-4" />
                  )}
                  Publier
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* ----- LIST TAB ----- */}
            <TabsContent value="list" className="m-0 min-h-0 flex-1 overflow-y-auto overscroll-contain p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="space-y-2">
                  {listLoading ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      <Loader2 className="mx-auto mb-2 size-6 animate-spin" />
                      Chargement de vos articles...
                    </p>
                  ) : articles.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Aucun article publié pour le moment.
                    </p>
                  ) : (
                    articles.map((a) => (
                      <div
                        key={a.id}
                        className="flex flex-col gap-2 rounded-md border bg-card p-3 sm:flex-row sm:items-center"
                      >
                        <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-muted">
                          {a.imageUrl ? (
                            <img
                              src={a.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl">
                              {SPORT_META[a.sport].emoji}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold">
                            {a.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                              {SCOPE_META[a.scope].label}
                            </Badge>
                            <Badge variant="outline" className="px-1 py-0 text-[10px]">
                              {SPORT_META[a.sport].emoji} {SPORT_META[a.sport].label}
                            </Badge>
                            {a.featured && (
                              <Badge className="bg-primary px-1 py-0 text-[10px]">À la une</Badge>
                            )}
                            {a.breaking && (
                              <Badge variant="destructive" className="px-1 py-0 text-[10px]">
                                Breaking
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(a.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {a.imageUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadUrl(a.imageUrl)}
                              aria-label="Télécharger l'image"
                              title="Télécharger le média"
                            >
                              <Download className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(a.id)}
                            aria-label="Supprimer"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
