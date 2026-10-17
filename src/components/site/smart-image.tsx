'use client'

import { useState } from 'react'

interface SmartImageProps {
  src: string
  alt: string
  className?: string
  /** Comment l'image doit s'adapter : contain = image entière, cover = remplit le cadre */
  fit?: 'contain' | 'cover'
  /** Désactiver le lazy loading (pour images above-the-fold) */
  priority?: boolean
  width?: number
  height?: number
}

/**
 * Image optimisée avec :
 * - Lazy loading natif
 * - Skeleton animé pendant le chargement
 * - Fallback si l'image échoue
 * - Loading="eager" si priority=true (above the fold)
 */
export function SmartImage({
  src,
  alt,
  className = '',
  fit = 'contain',
  priority = false,
  width,
  height,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  if (errored || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-secondary ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <svg className="h-8 w-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Skeleton pendant le chargement */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-muted to-secondary" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`h-full w-full transition-opacity duration-300 ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
