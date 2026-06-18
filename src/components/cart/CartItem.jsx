import { Link } from 'react-router-dom'
import { QuantitySelector } from '../product/QuantitySelector'
import { Button } from '../ui/Button'
import { TrashIcon } from '../ui/Icons'
import { generateProductPlaceholder } from '../../utils/images'
import { useCart } from '../../hooks/useCart'

export function CartItem({ item }) {
  const { dispatch } = useCart()

  const handleQuantityChange = (qty) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { variantId: item.variantId, quantity: qty },
    })
  }

  const handleRemove = () => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { variantId: item.variantId },
    })
  }

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0 animate-fade-in">
      <Link to={`/produto/${item.modelSlug}`} className="flex-shrink-0">
        <img
          src={item.image?.startsWith('http') ? item.image : generateProductPlaceholder(item.name, item.color || '#3b82f6')}
          alt={item.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/produto/${item.modelSlug}`}
            className="text-sm font-medium text-text-primary hover:text-accent transition-colors truncate"
          >
            {item.name}
          </Link>
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 text-text-muted hover:text-red-400 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {item.brand && <p className="text-xs text-text-muted mt-0.5">{item.brand}</p>}

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-muted">
          {item.color && <span>Cor: {item.color}</span>}
          {item.size && <span>Tamanho: {item.size}</span>}
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <QuantitySelector
            quantity={item.quantity}
            onChange={handleQuantityChange}
            className="h-8"
          />
          <span className="text-sm font-bold text-text-primary flex-shrink-0">
            {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>
    </div>
  )
}
