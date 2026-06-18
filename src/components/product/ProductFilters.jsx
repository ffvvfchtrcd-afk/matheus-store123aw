import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'name-asc', label: 'Nome A-Z' },
  { value: 'name-desc', label: 'Nome Z-A' },
]

export function ProductFilters({
  gender,
  subcategories,
  activeSubcategory,
  availableColors,
  availableSizes,
  minPrice,
  maxPrice,
  sort,
  priceMin,
  priceMax,
  selectedColor,
  selectedSize,
  onSortChange,
  onPriceMinChange,
  onPriceMaxChange,
  onColorChange,
  onSizeChange,
  onClear,
}) {
  const location = useLocation()
  const minRef = useRef(null)
  const maxRef = useRef(null)

  const hasFilters = priceMin || priceMax || selectedColor || selectedSize

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          to={`/${gender}`}
          className={cn(
            'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-colors duration-150',
            !activeSubcategory
              ? 'bg-accent text-black border-accent'
              : 'border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
          )}
        >
          Todas
        </Link>
        {(subcategories || []).map((sub) => {
          const isActive = activeSubcategory === sub.slug
          const path = `/${gender}/${sub.slug}`
          return (
            <Link
              key={sub.slug}
              to={path}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-colors duration-150',
                isActive
                  ? 'bg-accent text-black border-accent'
                  : 'border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
              )}
            >
              {sub.label}
            </Link>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sort || 'relevance'}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-muted transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Preço:</span>
          <input
            ref={minRef}
            type="number"
            value={priceMin || ''}
            onChange={(e) => onPriceMinChange(e.target.value)}
            placeholder={`${minPrice || 0}`}
            className="w-20 px-2 py-2 bg-surface-tertiary border border-border rounded-lg text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
          />
          <span className="text-xs text-text-muted">-</span>
          <input
            ref={maxRef}
            type="number"
            value={priceMax || ''}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            placeholder={`${maxPrice || 999}`}
            className="w-20 px-2 py-2 bg-surface-tertiary border border-border rounded-lg text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
          />
        </div>

        {availableColors.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-muted">Cor:</span>
            <button
              onClick={() => onColorChange('')}
              className={`px-2.5 py-1.5 text-xs rounded-lg border-2 transition-all ${
                !selectedColor ? 'bg-accent text-black border-accent shadow-[0_0_8px_rgba(232,184,74,0.3)]' : 'border-accent/25 text-text-secondary hover:border-accent/50'
              }`}
            >
              Todas
            </button>
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(selectedColor === color ? '' : color)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border-2 transition-all ${
                  selectedColor === color ? 'bg-accent text-black border-accent shadow-[0_0_8px_rgba(232,184,74,0.3)]' : 'border-accent/25 text-text-secondary hover:border-accent/50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        )}

        {availableSizes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-muted">Tam.:</span>
            <button
              onClick={() => onSizeChange('')}
              className={`px-2.5 py-1.5 text-xs rounded-lg border-2 transition-all ${
                !selectedSize ? 'bg-accent text-black border-accent shadow-[0_0_8px_rgba(232,184,74,0.3)]' : 'border-accent/25 text-text-secondary hover:border-accent/50'
              }`}
            >
              Todos
            </button>
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(selectedSize === size ? '' : size)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border-2 transition-all ${
                  selectedSize === size ? 'bg-accent text-black border-accent shadow-[0_0_8px_rgba(232,184,74,0.3)]' : 'border-accent/25 text-text-secondary hover:border-accent/50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-text-muted hover:text-red-400 transition-colors px-2 py-1"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
