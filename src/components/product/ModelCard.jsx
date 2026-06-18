import { useState } from 'react'
import { Link } from 'react-router-dom'
import { generateProductPlaceholder } from '../../utils/images'
import { Button } from '../ui/Button'
import { StarIcon } from '../ui/Icons'
import { WishlistButton } from './WishlistButton'
import { QuickViewModal } from './QuickViewModal'

export function ModelCard({ model }) {
  const [quickViewSlug, setQuickViewSlug] = useState(null)
  const [imgError, setImgError] = useState(false)

  const lowestPrice = model.variants?.reduce((min, v) => Math.min(min, v.price), Infinity) || 0
  const hasOriginal = model.variants?.some(v => v.originalPrice)
  const highestOriginal = hasOriginal
    ? model.variants?.reduce((max, v) => Math.max(max, v.originalPrice || 0), 0)
    : null
  const hasDiscount = highestOriginal > lowestPrice

  const imgSrc = !imgError
    ? (model.colorImages?.[model.colors?.[0]] || model.images?.[0] || generateProductPlaceholder(model.name, model.colors?.[0] || '#3b82f6'))
    : generateProductPlaceholder(model.name, model.colors?.[0] || '#3b82f6')

  return (
    <>
      <Link to={`/produto/${model.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-surface-secondary border border-accent/30 group-hover:border-accent/70 shadow-[0_0_10px_rgba(232,184,74,0.08)] group-hover:shadow-[0_0_25px_rgba(232,184,74,0.3)] transition-all duration-300 aspect-[3/4]">
          <img
            src={imgSrc}
            alt={model.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{model.discountPercentage}%
            </span>
          )}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton modelSlug={model.slug} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 gap-2">
            <Button size="sm" className="flex-1" onClick={(e) => {
              e.preventDefault()
              setQuickViewSlug(model.slug)
            }}>
              Quick View
            </Button>
          </div>
        </div>
        <div className="mt-2 px-1">
          <p className="text-xs text-text-muted uppercase tracking-wider">{model.brand}</p>
          <h3 className="text-sm font-medium text-text-primary truncate">{model.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-green-400">
                  {lowestPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="text-xs text-text-muted line-through">
                  {highestOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-green-400">
                {lowestPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <StarIcon className="w-3 h-3 text-accent" />
            <span className="text-xs text-text-muted">{model.rating || 4.5}</span>
          </div>
        </div>
      </Link>
      {quickViewSlug && <QuickViewModal slug={quickViewSlug} onClose={() => setQuickViewSlug(null)} />}
    </>
  )
}
