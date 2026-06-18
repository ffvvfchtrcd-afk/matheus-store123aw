import { useState } from 'react'
import { cn } from '../../utils/cn'
import { ImagePlaceholderIcon } from '../ui/Icons'

export function ProductImage({ src, alt, className, priority }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={cn('bg-surface-secondary flex items-center justify-center', className)}>
        <ImagePlaceholderIcon className="w-12 h-12 text-text-muted" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-surface-secondary', className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface-secondary via-surface-tertiary to-surface-secondary animate-shimmer bg-[length:200%_100%]" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}
