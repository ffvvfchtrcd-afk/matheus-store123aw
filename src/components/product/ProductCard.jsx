import { Link } from 'react-router-dom'
import { ProductImage } from './ProductImage'
import { Button } from '../ui/Button'
import { StarIcon } from '../ui/Icons'
import { formatCurrency } from '../../utils/formatCurrency'
import { getProductImage } from '../../utils/images'
import { useCart } from '../../hooks/useCart'

export function ProductCard({ product, variant = 'default' }) {
  const { dispatch } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({
      type: 'ADD_ITEM',
      payload: { product, size: product.sizes[0], color: product.colors[0], quantity: 1 },
    })
  }

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/produto/${product.slug}`}
        className="flex gap-4 p-3 rounded-xl hover:bg-surface-secondary transition-colors duration-200 group"
      >
        <ProductImage
          src={getProductImage(product)}
          alt={product.name}
          className="w-24 h-24 rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-text-primary">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-text-muted line-through">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="group block animate-fade-in"
    >
      <div className="relative overflow-hidden rounded-xl bg-surface-secondary border border-accent/30 group-hover:border-accent/70 shadow-[0_0_10px_rgba(232,184,74,0.08)] group-hover:shadow-[0_0_25px_rgba(232,184,74,0.3)] transition-all duration-300">
        <ProductImage
          src={getProductImage(product)}
          alt={product.name}
          className="aspect-[4/5] rounded-lg"
          priority={product.featured}
        />

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
            <span className="text-text-primary text-sm font-medium px-3 py-1 bg-surface/80 rounded-lg">Indisponível</span>
          </div>
        )}

        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Adicionar' : 'Indisponível'}
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-text-primary">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-text-muted line-through">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <StarIcon className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs">{product.rating}</span>
        </div>
      </div>
    </Link>
  )
}
