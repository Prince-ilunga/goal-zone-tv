'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Article } from '@/lib/types'
import { SCOPE_META, SPORT_META } from '@/lib/types'
import { timeAgo } from '@/lib/format'

interface SearchAutocompleteProps {
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

export function SearchAutocomplete({
  className = '',
  placeholder = 'Rechercher un article...',
  autoFocus = false,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Recherche debounced (300ms)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(query.trim())}&limit=8`)
        if (!res.ok) return
        const data = await res.json()
        setResults(data.articles || [])
        setOpen(true)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const selectArticle = (article: Article) => {
    setOpen(false)
    setQuery('')
    router.push(`/articles/${article.slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        router.push(`/?search=${encodeURIComponent(query.trim())}#newsroom`)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < results.length) {
        selectArticle(results[activeIndex])
      } else if (results.length > 0) {
        selectArticle(results[0])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(-1)
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-11 rounded-xl border-border bg-secondary/50 pl-10 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Recherche d'articles"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!loading && query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setOpen(false)
            }}
            aria-label="Effacer"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Dropdown des résultats */}
      {open && results.length > 0 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl max-h-[400px] overflow-y-auto scrollbar-thin"
        >
          {results.map((article, i) => {
            const scope = SCOPE_META[article.scope]
            const sport = SPORT_META[article.sport]
            return (
              <button
                key={article.id}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectArticle(article)}
                className={`flex w-full items-start gap-3 border-b border-border/50 p-3 text-left transition-colors last:border-0 ${
                  i === activeIndex ? 'bg-primary/5' : 'hover:bg-secondary/50'
                }`}
              >
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-md object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-secondary text-lg">
                    {sport.emoji}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className="text-[10px]">{sport.emoji}</span>
                    <span className={`text-[10px] font-semibold uppercase ${scope.color}`}>
                      {scope.label}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium leading-snug">
                    {article.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(article.createdAt)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Aucun résultat */}
      {open && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-card p-4 text-center shadow-xl">
          <p className="text-sm text-muted-foreground">
            Aucun article trouvé pour «&nbsp;{query}&nbsp;»
          </p>
        </div>
      )}
    </div>
  )
}
