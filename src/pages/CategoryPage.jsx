import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductFilters } from '../components/product/ProductFilters'
import { SubcategoryGrid } from '../components/category/SubcategoryGrid'
import { BrandGrid } from '../components/category/BrandGrid'
import { EmptyState } from '../components/ui/EmptyState'
import { Pagination } from '../components/ui/Pagination'
import { ArrowLeftIcon } from '../components/ui/Icons'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import { useModelsDB, useModelFilters } from '../hooks/useModelsDB'
import { usePagination } from '../hooks/usePagination'
import { useCategoryDB } from '../hooks/useCategoriesDB'
import { useBrandsDB } from '../hooks/useBrandsDB'

const ITEMS_PER_PAGE = 12

export default function CategoryPage() {
  const { gender, subcategory, brand } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = searchParams.get('sort') || 'relevance'
  const priceMin = searchParams.get('priceMin') || ''
  const priceMax = searchParams.get('priceMax') || ''
  const selectedColor = searchParams.get('color') || ''
  const selectedSize = searchParams.get('size') || ''

  const { category, loading: catLoading } = useCategoryDB(gender)
  const { models, loading: prodLoading } = useModelsDB({
    gender,
    subcategory,
    brand,
    sort,
    minPrice: priceMin,
    maxPrice: priceMax,
    color: selectedColor,
    size: selectedSize,
  })
  const { brands, loading: brandLoading } = useBrandsDB({ gender, subcategory })
  const { colors: availableColors, sizes: availableSizes, minPrice, maxPrice } = useModelFilters(models)
  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(models, ITEMS_PER_PAGE)

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      return next
    })
    goToPage(1)
  }

  const clearFilters = () => setSearchParams({})

  if (!catLoading && !category) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Categoria não encontrada"
          description="A categoria que você procura não existe."
          actionLabel="Voltar ao Início"
          actionLink="/"
        />
      </Container>
    )
  }

  if (catLoading || !category) {
    return (
      <Container className="py-20">
        <div className="h-8 w-64 bg-surface-secondary animate-pulse rounded-lg mb-6" />
        <div className="h-10 w-48 bg-surface-secondary animate-pulse rounded-lg mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-surface-secondary animate-pulse rounded-2xl" />
          ))}
        </div>
      </Container>
    )
  }

  const activeSubcategory = category.subcategories?.find((s) => s.slug === subcategory)

  const breadcrumbItems = [
    { label: 'Início', path: '/' },
    { label: category.label, path: `/${gender}` },
  ]
  if (subcategory) {
    const subLabel = activeSubcategory?.label || subcategory
    breadcrumbItems.push({ label: subLabel, path: `/${gender}/${subcategory}` })
  }
  if (brand) {
    const brandName = brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    breadcrumbItems.push({ label: brandName })
  }

  if (!subcategory) {
    return (
      <Container className="py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">{category.label}</h1>
          <p className="mt-2 text-text-secondary">{category.description}</p>
        </div>
        <SubcategoryGrid gender={gender} subcategories={category.subcategories || []} />
      </Container>
    )
  }

  if (!brand) {
    return (
      <Container className="py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <Link
              to={`/${gender}`}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">{activeSubcategory?.label}</h1>
              <p className="mt-1 text-text-secondary">Escolha sua marca favorita</p>
            </div>
          </div>
        </div>

        {brandLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square bg-surface-secondary animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <EmptyState
            title="Nenhuma marca disponível"
            description={`Nenhuma marca encontrada para ${activeSubcategory?.label}.`}
            actionLabel={`Ver todos em ${category.label}`}
            actionLink={`/${gender}`}
          />
        ) : (
          <BrandGrid gender={gender} subcategory={subcategory} brands={brands} />
        )}
      </Container>
    )
  }

  const brandName = brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Container className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/${gender}/${subcategory}`}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{brandName}</h1>
            <p className="text-sm text-text-secondary">{activeSubcategory?.label} — {category.label}</p>
          </div>
        </div>

        <ProductFilters
          gender={gender}
          subcategories={category.subcategories}
          activeSubcategory={subcategory}
          availableColors={availableColors}
          availableSizes={availableSizes}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          priceMin={priceMin}
          priceMax={priceMax}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onSortChange={(v) => updateParam('sort', v === 'relevance' ? '' : v)}
          onPriceMinChange={(v) => updateParam('priceMin', v)}
          onPriceMaxChange={(v) => updateParam('priceMax', v)}
          onColorChange={(v) => updateParam('color', v)}
          onSizeChange={(v) => updateParam('size', v)}
          onClear={clearFilters}
        />

        {prodLoading ? (
          <ProductGridSkeleton count={4} />
        ) : models.length === 0 ? (
          <EmptyState
            title="Nenhum produto encontrado"
            description={`Nenhum modelo encontrado com os filtros selecionados.`}
            actionLabel="Limpar Filtros"
            actionLink={`/${gender}/${subcategory}/${brand}`}
          />
        ) : (
          <>
            <p className="text-sm text-text-muted mb-4">
              Mostrando {paginatedItems.length} de {models.length} modelo{models.length !== 1 ? 's' : ''}
            </p>
            <ProductGrid models={paginatedItems} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
          </>
        )}
      </div>
    </Container>
  )
}
