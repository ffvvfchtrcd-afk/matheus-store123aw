import { useState, useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { ArrowRightIcon } from '../components/ui/Icons'
import { CategoryCard } from '../components/category/CategoryCard'
import { ModelCard } from '../components/product/ModelCard'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import { useFeaturedModelsDB } from '../hooks/useModelsDB'
import { useCategoriesDB } from '../hooks/useCategoriesDB'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useToast } from '../context/ToastContext'
import { DatabaseContext } from '../context/DatabaseContext'
import { getModelBySlug } from '../db/modelRepo'
import { subscribeEmail } from '../db/newsletterRepo'
import { getHeroImage } from '../utils/images'
import brandsData from '../data/brands.json'

function BrandCarousel() {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const didDrag = useRef(false)

  const brands = brandsData || []
  if (brands.length === 0) return null

  const handleMouseDown = (e) => {
    setIsDragging(true)
    didDrag.current = false
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const diff = Math.abs(x - startX)
    if (diff > 5) didDrag.current = true
    scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5
  }
  const handleMouseUp = () => setIsDragging(false)

  const handleClick = (e) => {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <Container className="pb-10">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Marcas</h2>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {brands.map((brand, i) => (
          <Link
            key={brand.name || i}
            to={`/${brand.gender || 'masculino'}/${brand.subcategory || 'camisetas'}/${(brand.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            className={`flex-shrink-0 px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
              hoveredIdx === i ? 'border-accent bg-accent/15 scale-105 shadow-[0_0_20px_rgba(232,184,74,0.3)]' : 'border-accent/25 bg-surface-secondary hover:border-accent/50 hover:shadow-[0_0_12px_rgba(232,184,74,0.15)]'
            }`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={handleClick}
            draggable={false}
          >
            <span className="text-sm font-medium text-text-primary whitespace-nowrap">{brand.name}</span>
          </Link>
        ))}
      </div>
    </Container>
  )
}

function PromoBanners() {
  return (
    <Container className="pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/ofertas" className="relative group overflow-hidden rounded-2xl h-48 bg-gradient-to-br from-accent/10 to-surface-secondary border-2 border-accent/40 hover:border-accent/80 shadow-[0_0_12px_rgba(232,184,74,0.1)] hover:shadow-[0_0_30px_rgba(232,184,74,0.3)] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 p-8 flex flex-col justify-end h-full">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider">Promoção</p>
            <h3 className="text-2xl font-bold text-text-primary mt-1">Até 50% OFF</h3>
            <p className="text-sm text-text-secondary mt-1">Aproveite as ofertas da semana</p>
          </div>
        </Link>
        <Link to="/masculino/camisetas" className="relative group overflow-hidden rounded-2xl h-48 bg-gradient-to-br from-accent/5 to-surface-secondary border-2 border-accent/30 hover:border-accent/70 shadow-[0_0_10px_rgba(232,184,74,0.08)] hover:shadow-[0_0_25px_rgba(232,184,74,0.25)] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 p-8 flex flex-col justify-end h-full">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider">Coleção</p>
            <h3 className="text-2xl font-bold text-text-primary mt-1">Camisetas</h3>
            <p className="text-sm text-text-secondary mt-1">Conforto e estilo para o dia a dia</p>
          </div>
        </Link>
      </div>
    </Container>
  )
}

function RecentlyViewedSection() {
  const { ready } = useContext(DatabaseContext)
  const { recentlyViewedSlugs } = useRecentlyViewed()
  const [models, setModels] = useState([])

  useEffect(() => {
    if (!ready) return
    let mounted = true
    ;(async () => {
      try {
        const results = await Promise.all(
          (recentlyViewedSlugs || []).slice(0, 4).map((slug) => getModelBySlug(slug))
        )
        if (mounted) setModels(results.filter(Boolean))
      } catch {}
    })()
    return () => { mounted = false }
  }, [ready, recentlyViewedSlugs])

  if (models.length === 0) return null

  return (
    <Container className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Vistos Recentemente</h2>
          <p className="mt-1 text-sm text-text-secondary">Continue de onde parou</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {models.map((model) => (
          <ModelCard key={model.slug} model={model} />
        ))}
      </div>
    </Container>
  )
}

export default function Home() {
  const { models: featured, loading: featuredLoading } = useFeaturedModelsDB()
  const { categories, loading: catLoading } = useCategoriesDB()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setSubscribing(true)
    try {
      const created = await subscribeEmail(email)
      if (created) {
        addToast('Inscrição realizada com sucesso!', 'success')
        setEmail('')
      } else {
        addToast('Este email já está cadastrado.', 'info')
      }
    } catch {
      addToast('Erro ao realizar inscrição.', 'error')
    }
    setSubscribing(false)
  }

  return (
    <div className="pt-10">
      <BrandCarousel />

      <Container className="pb-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Categorias</h2>
            <p className="mt-2 text-text-secondary">Explore nossas coleções completas</p>
          </div>
          <span className="hidden sm:flex items-center gap-2 text-sm text-text-muted">
            Encontre seu estilo
            <ArrowRightIcon className="w-4 h-4" />
          </span>
        </div>
        {catLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[400px] rounded-2xl bg-surface-secondary animate-pulse" />
            <div className="h-[400px] rounded-2xl bg-surface-secondary animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(categories || []).map((cat) => (
              <CategoryCard key={cat.slug} category={cat} slug={cat.slug} />
            ))}
          </div>
        )}
      </Container>

      <RecentlyViewedSection />

      <Container className="pb-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Destaques</h2>
            <p className="mt-2 text-text-secondary">Os produtos mais populares da semana</p>
          </div>
          <Link
            to="/masculino"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Ver Todos
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        {featuredLoading ? (
          <ProductGridSkeleton count={4} />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 bg-surface-secondary border border-accent/15 rounded-xl">
            <p className="text-text-muted">Nenhum produto em destaque no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((model) => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>
        )}
      </Container>

      <Container className="pb-20">
        <div className="relative bg-surface-secondary border-2 border-accent/35 rounded-3xl p-8 sm:p-14 text-center overflow-hidden animate-fade-in shadow-[0_0_35px_rgba(232,184,74,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/3 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-text-primary">
              Fique por dentro das novidades
            </h2>
            <p className="mt-3 text-text-secondary max-w-md mx-auto">
              Cadastre-se e receba ofertas exclusivas, lançamentos e muito mais.
            </p>
            <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="flex-1 px-5 py-3.5 bg-surface-tertiary border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
              />
              <Button type="submit" variant="primary" size="lg" disabled={subscribing}>
                {subscribing ? 'Assinando...' : 'Assinar'}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  )
}
