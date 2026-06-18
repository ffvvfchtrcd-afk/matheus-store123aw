import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { QuantitySelector } from '../components/product/QuantitySelector'
import { ModelCard } from '../components/product/ModelCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ImageZoom } from '../components/ui/ImageZoom'
import { ReviewsSection } from '../components/product/ReviewsSection'
import { SizeGuideModal } from '../components/product/SizeGuideModal'
import { WishlistButton } from '../components/product/WishlistButton'
import { StarIcon, TruckIcon, ReturnIcon } from '../components/ui/Icons'
import { ProductSearchIllustration } from '../components/ui/Illustrations'
import { Skeleton } from '../components/ui/Skeleton'
import { useModelDB, useRelatedModelsDB } from '../hooks/useModelsDB'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useCart } from '../hooks/useCart'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { generateProductPlaceholder } from '../utils/images'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { model, loading } = useModelDB(slug)
  const { models: relatedModels } = useRelatedModelsDB(model)
  const { dispatch } = useCart()
  const { addToast } = useToast()
  const { isAuthenticated } = useAuth()
  const { addSlug } = useRecentlyViewed()

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (model?.slug) addSlug(model.slug)
  }, [model?.slug])

  if (loading) {
    return (
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </Container>
    )
  }

  if (!model) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={ProductSearchIllustration}
          title="Produto não encontrado"
          description="O produto que você procura não existe ou foi removido."
          actionLabel="Ver Produtos"
          actionLink="/"
        />
      </Container>
    )
  }

  const variants = model.variants || []
  const sizes = [...new Set(variants.map((v) => v.size))]
  const colors = [...new Set(variants.filter((v) => !selectedSize || v.size === selectedSize).map((v) => v.color))]

  const currentSize = selectedSize || sizes[0] || ''
  const currentColor = selectedColor || colors[0] || ''

  const currentVariant = variants.find((v) => v.size === currentSize && v.color === currentColor)
  const inStock = currentVariant ? currentVariant.stock > 0 : false
  const price = currentVariant?.price || 0
  const originalPrice = currentVariant?.originalPrice || 0
  const hasDiscount = originalPrice > price

  const mainImg = !imgError
    ? (model.colorImages?.[currentColor] || model.images?.[0] || generateProductPlaceholder(model.name, currentColor || model.colors?.[0] || '#3b82f6'))
    : generateProductPlaceholder(model.name, currentColor || model.colors?.[0] || '#3b82f6')

  const handleAddToCart = () => {
    if (!currentVariant) return
    if (!isAuthenticated) {
      navigate(`/entrar?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    dispatch({
      type: 'ADD_ITEM',
      payload: { model, variant: currentVariant, quantity },
    })
    addToast(`${model.name} (${currentSize}, ${currentColor}) adicionado ao carrinho!`, 'success')
  }

  const breadcrumbItems = [
    { label: 'Início', path: '/' },
    { label: model.gender === 'masculino' ? 'Masculino' : 'Feminino', path: `/${model.gender}` },
    {
      label: model.subcategory,
      path: `/${model.gender}/${model.subcategory}`,
    },
    { label: model.name },
  ]

  return (
    <Container className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-fade-in">
        <div className="space-y-4">
          <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-surface-secondary border-2 border-accent/30 shadow-[0_0_20px_rgba(232,184,74,0.1)]">
            <ImageZoom
              src={mainImg}
              alt={model.name}
              className="w-full h-full"
            />
          </div>
          {model.colors && model.colors.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {model.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => { setSelectedColor(color); setImgError(false) }}
                  className={`aspect-square rounded-xl overflow-hidden bg-surface-secondary border transition-all duration-150 ${
                    currentColor === color ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-text-muted'
                  }`}
                >
                  <img
                    src={model.colorImages?.[color] || generateProductPlaceholder(model.name, color)}
                    alt={`${model.name} - ${color}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{model.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(model.rating || 4.5) ? 'text-accent' : 'text-text-muted opacity-30'}`}
                  />
                ))}
                <span className="text-sm text-text-secondary ml-1">{model.rating || 4.5}</span>
                <span className="text-text-muted">({model.reviews || 0} avaliações)</span>
              </div>
              {model.brand && (
                <span className="inline-block mt-1 text-xs font-medium text-text-muted bg-surface-secondary px-2 py-1 rounded-md">
                  {model.brand}
                </span>
              )}
            </div>
            <WishlistButton modelSlug={model.slug} variant="icon" />
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-text-primary">
              {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-text-muted line-through">
                  {originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="text-sm font-bold text-red-500">-{model.discountPercentage}%</span>
              </>
            )}
          </div>

          <div className="bg-surface-secondary rounded-xl p-5 border border-accent/35 shadow-[0_0_15px_rgba(232,184,74,0.12)]">
            <p className="text-sm text-text-secondary leading-relaxed">{model.description}</p>
          </div>

          {colors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                Cor: <span className="font-normal text-text-secondary">{currentColor}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => { setSelectedColor(color); setImgError(false) }}
                  className={`px-4 py-2 text-sm rounded-lg border-2 transition-all duration-150 ${
                      currentColor === color
                        ? 'bg-accent text-black border-accent shadow-[0_0_12px_rgba(232,184,74,0.35)]'
                        : 'border-accent/25 text-text-secondary hover:border-accent/60 hover:text-text-primary hover:shadow-[0_0_8px_rgba(232,184,74,0.15)]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  Tamanho: <span className="font-normal text-text-secondary">{currentSize}</span>
                </h3>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-accent hover:underline"
                >
                  Guia de Tamanhos
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!variants.some((v) => v.size === size && v.stock > 0)}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-all duration-150 ${
                      currentSize === size
                        ? 'bg-accent text-black border-accent shadow-[0_0_12px_rgba(232,184,74,0.35)]'
                        : 'border-accent/25 text-text-secondary hover:border-accent/60 hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_8px_rgba(232,184,74,0.15)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-text-primary">Quantidade:</span>
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleAddToCart}
            disabled={!inStock}
            className="relative h-14 text-base"
          >
            {!inStock
              ? 'Indisponível'
              : `Adicionar ao Carrinho — ${(price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 text-sm text-text-muted p-4 rounded-xl bg-surface-secondary border border-accent/30 shadow-[0_0_10px_rgba(232,184,74,0.08)]">
              <TruckIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
              <div>
                <p className="font-medium text-text-primary">Frete Grátis</p>
                <p className="text-xs">Acima de R$ 199,00</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-muted p-4 rounded-xl bg-surface-secondary border border-accent/30 shadow-[0_0_10px_rgba(232,184,74,0.08)]">
              <ReturnIcon className="w-5 h-5 flex-shrink-0 text-accent/70" />
              <div>
                <p className="font-medium text-text-primary">Devolução Grátis</p>
                <p className="text-xs">Em até 30 dias</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewsSection modelSlug={slug} rating={model.rating} reviewCount={model.reviews} />

      {relatedModels.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedModels.map((m) => (
              <ModelCard key={m.slug} model={m} />
            ))}
          </div>
        </section>
      )}

      {sizeGuideOpen && <SizeGuideModal sizes={sizes} onClose={() => setSizeGuideOpen(false)} />}
    </Container>
  )
}
