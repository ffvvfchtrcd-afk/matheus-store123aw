import { useSearchParams, Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState } from '../components/ui/EmptyState'
import { ProductSearchIllustration } from '../components/ui/Illustrations'
import { ArrowLeftIcon, SearchIcon } from '../components/ui/Icons'
import { useSearch } from '../hooks/useSearch'
import { usePagination } from '../hooks/usePagination'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { results, loading } = useSearch(query)
  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(results, 12)

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Início', path: '/' }, { label: 'Busca' }]} />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-3">
              <SearchIcon className="w-6 h-6 text-text-muted" />
              Resultados para "{query}"
            </h1>
          </div>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={ProductSearchIllustration}
          title="Nenhum resultado encontrado"
          description={`Não encontramos resultados para "${query}". Tente outro termo.`}
          actionLabel="Ver Produtos em Destaque"
          actionLink="/"
        />
      ) : (
        <>
          <p className="text-sm text-text-muted mb-4">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
          </p>
          <ProductGrid models={paginatedItems} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </Container>
  )
}
