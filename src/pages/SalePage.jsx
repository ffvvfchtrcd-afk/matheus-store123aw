import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ProductGrid } from '../components/product/ProductGrid'
import { EmptyState } from '../components/ui/EmptyState'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import { useModelsDB } from '../hooks/useModelsDB'

export default function SalePage() {
  const { models, loading } = useModelsDB({})
  const discounted = (models || []).filter((m) =>
    (m.variants || []).some((v) => v.originalPrice && v.originalPrice > v.price)
  )

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Início', path: '/' }, { label: 'Ofertas' }]} />

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Ofertas</h1>
        <p className="mt-2 text-text-secondary">Produtos com desconto por tempo limitado</p>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : discounted.length === 0 ? (
        <EmptyState
          title="Nenhuma oferta no momento"
          description="Volte mais tarde para conferir nossas promoções."
          actionLabel="Ver Todos os Produtos"
          actionLink="/"
        />
      ) : (
        <>
          <p className="text-sm text-text-muted mb-4">{discounted.length} produto{discounted.length !== 1 ? 's' : ''} em oferta</p>
          <ProductGrid models={discounted} />
        </>
      )}
    </Container>
  )
}
