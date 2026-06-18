import { cn } from '../../utils/cn'
import { MinusIcon, PlusIcon } from '../ui/Icons'

export function QuantitySelector({ quantity, onChange, min = 1, max = 99, className }) {
  const decrement = () => {
    if (quantity > min) onChange(quantity - 1)
  }
  const increment = () => {
    if (quantity < max) onChange(quantity + 1)
  }

  return (
    <div className={cn('flex items-center border-2 border-accent/30 rounded-lg overflow-hidden', className)}>
      <button
        onClick={decrement}
        disabled={quantity <= min}
        className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      <span className="w-10 h-10 flex items-center justify-center text-sm font-medium text-text-primary border-x border-accent/25">
        {quantity}
      </span>
      <button
        onClick={increment}
        disabled={quantity >= max}
        className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
