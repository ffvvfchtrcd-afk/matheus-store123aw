import { ModelCard } from './ModelCard'
import { ProductGridSkeleton } from '../ui/Skeleton'
import { cn } from '../../utils/cn'

export function ProductGrid({ models, loading, columns, className }) {
  if (loading) {
    return <ProductGridSkeleton />
  }

  if (!models || models.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        columns === 3 && 'lg:grid-cols-3',
        columns === 2 && 'sm:grid-cols-2 lg:grid-cols-2',
        className
      )}
    >
      {models.map((model) => (
        <ModelCard key={model.slug} model={model} />
      ))}
    </div>
  )
}
