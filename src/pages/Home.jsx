import { useState, useEffect, useContext, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { ArrowRightIcon } from '../components/ui/Icons'
import { CategoryCard } from '../components/category/CategoryCard'
import { ProductCarousel } from '../components/product/ProductCarousel'
import { useFeaturedModelsDB, useModelsDB } from '../hooks/useModelsDB'
import { useCategoriesDB } from '../hooks/useCategoriesDB'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useToast } from '../context/ToastContext'
import { DatabaseContext } from '../context/DatabaseContext'
import { getModelBySlug } from '../db/modelRepo'
import { subscribeEmail } from '../db/newsletterRepo'
import brandsData from '../data/brands.json'

function BrandCarousel() {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeftVal = useRef(0)
  const didDrag = useRef(false)

  const brands = brandsData || []
  if (brands.length === 0) return null

  const handleMouseDown = (e) => {
    setIsDragging(true)
    didDrag.current = false
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeftVal.current = scrollRef.current.scrollLeft
  }
  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const diff = Math.abs(x - startX.current)
    if (diff > 5) didDrag.current = true
    scrollRef.current.scrollLeft = scrollLeftVal.current - (x - startX.current) * 1.5
  }
  const handleMouseUp = () => setIsDragging(false)

  const handleClick = (e) => {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <Container className="pb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-5">Marcas</h2>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {brands.map((brand, i) => (
          <Link
            key={brand.name || i}
            to={`/${brand.gender || 'masculino'}/${brand.subcategory || 'camisetas'}/${(brand.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 ${
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

function CategoryCards() {
  const { categories, loading } = useCategoriesDB()
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeftVal = useRef(0)
  const didDrag = useRef(false)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    didDrag.current = false
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeftVal.current = scrollRef.current.scrollLeft
  }
  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const diff = Math.abs(x - startX.current)
    if (diff > 5) didDrag.current = true
    scrollRef.current.scrollLeft = scrollLeftVal.current - (x - startX.current) * 1.5
  }
  const handleMouseUp = () => setIsDragging(false)
  const handleClick = (e) => { if (didDrag.current) { e.preventDefault(); e.stopPropagation() } }

  if (loading) return (
    <div className="pb-8">
      <div className="h-8 w-48 bg-surface-secondary rounded animate-pulse mb-4" />
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-[280px] h-[350px] bg-surface-secondary rounded-2xl animate-pulse" />
        <div className="flex-shrink-0 w-[280px] h-[350px] bg-surface-secondary rounded-2xl animate-pulse" />
      </div>
    </div>
  )

  return (
    <Container className="pb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Categorias</h2>
          <p className="mt-1 text-sm text-text-secondary">Explore nossas coleções</p>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-none select-none cursor-grab active:cursor-grabbing -mx-4 px-4 sm:mx-0 sm:px-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {(categories || []).map((cat) => (
          <div key={cat.slug} className="flex-shrink-0 w-[260px] sm:w-[300px]" onClick={handleClick}>
            <CategoryCard category={cat} slug={cat.slug} />
          </div>
        ))}
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
          (recentlyViewedSlugs || []).slice(0, 8).map((slug) => getModelBySlug(slug))
        )
        if (mounted) setModels(results.filter(Boolean))
      } catch {}
    })()
    return () => { mounted = false }
  }, [ready, recentlyViewedSlugs])

  if (models.length === 0) return null

  return (
    <Container>
      <ProductCarousel
        title="Vistos Recentemente"
        subtitle="Continue de onde parou"
        models={models}
      />
    </Container>
  )
}

export default function Home() {
  const { models: featured, loading: featuredLoading } = useFeaturedModelsDB()
  const { models: masculino, loading: mascLoading } = useModelsDB({ gender: 'masculino' })
  const { models: feminino, loading: femLoading } = useModelsDB({ gender: 'feminino' })
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
    <div className="pt-6">
      <BrandCarousel />
      <CategoryCards />

      <Container>
        <ProductCarousel
          title="Destaques"
          subtitle="Os mais populares da semana"
          models={featured}
          loading={featuredLoading}
          viewAllLink="/masculino"
          viewAllLabel="Ver Todos"
        />
      </Container>

      <Container>
        <ProductCarousel
          title="Masculino"
          subtitle="Estilo e conforto para o dia a dia"
          models={masculino}
          loading={mascLoading}
          viewAllLink="/masculino"
          viewAllLabel="Ver Todos"
        />
      </Container>

      <Container>
        <ProductCarousel
          title="Feminino"
          subtitle="Elegância e tendência"
          models={feminino}
          loading={femLoading}
          viewAllLink="/feminino"
          viewAllLabel="Ver Todos"
        />
      </Container>

      <RecentlyViewedSection />

      <Container className="pt-4 pb-20">
        <div className="relative bg-surface-secondary border-2 border-accent/35 rounded-3xl p-8 sm:p-12 text-center overflow-hidden animate-fade-in shadow-[0_0_35px_rgba(232,184,74,0.15)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/3 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Fique por dentro das novidades
            </h2>
            <p className="mt-3 text-text-secondary max-w-md mx-auto">
              Cadastre-se e receba ofertas exclusivas, lançamentos e muito mais.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="flex-1 px-5 py-3 bg-surface-tertiary border border-accent/30 rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_12px_rgba(232,184,74,0.25)] transition-all"
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
