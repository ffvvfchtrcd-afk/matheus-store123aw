import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { ArrowRightIcon, LogoSVG } from '../components/ui/Icons'
import { HeroIllustration } from '../components/ui/Illustrations'
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
  const brands = brandsData || []
  if (brands.length === 0) return null
  return (
    <Container className="pb-10">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Marcas</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        {brands.map((brand, i) => (
          <Link
            key={brand.name || i}
            to={`/${brand.gender || 'masculino'}/${brand.subcategory || 'camisetas'}/${(brand.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            className={`flex-shrink-0 px-6 py-3 rounded-xl border transition-all duration-200 ${
              hoveredIdx === i ? 'border-accent bg-accent/5 scale-105' : 'border-border bg-surface-secondary hover:border-text-muted'
            }`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
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
        <Link to="/ofertas" className="relative group overflow-hidden rounded-2xl h-48 bg-gradient-to-br from-red-900/40 to-surface-secondary border border-border">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 p-8 flex flex-col justify-end h-full">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Promoção</p>
            <h3 className="text-2xl font-bold text-white mt-1">Até 50% OFF</h3>
            <p className="text-sm text-neutral-300 mt-1">Aproveite as ofertas da semana</p>
          </div>
        </Link>
        <Link to="/masculino/camisetas" className="relative group overflow-hidden rounded-2xl h-48 bg-gradient-to-br from-blue-900/40 to-surface-secondary border border-border">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 p-8 flex flex-col justify-end h-full">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Coleção</p>
            <h3 className="text-2xl font-bold text-white mt-1">Camisetas</h3>
            <p className="text-sm text-neutral-300 mt-1">Conforto e estilo para o dia a dia</p>
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
    <div>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <img
          src={getHeroImage()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

        <Container className="relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <LogoSVG className="w-10 h-10" />
                <span className="text-sm font-medium text-neutral-400 tracking-widest uppercase">Nova Coleção 2025</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Estilo que<br />
                <span className="text-neutral-300">define quem</span><br />
                você é
              </h1>
              <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-md">
                Moda masculina e feminina com curadoria especial. Qualidade, conforto e as tendências que você procura em um só lugar.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button variant="primary" size="lg" asChild>
                  <Link to="/masculino">Coleção Masculina</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/feminino">Coleção Feminina</Link>
                </Button>
              </div>
              <div className="mt-10">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/ofertas" className="text-red-400 hover:text-red-300">
                    Ver Ofertas →
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-8 text-sm text-neutral-500">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Frete Grátis
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                  Devolução 30 dias
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                  Pagamento Seguro
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroIllustration className="w-full h-auto opacity-80" />
            </div>
          </div>
        </Container>
      </section>

      <PromoBanners />
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
          <div className="text-center py-12 bg-surface-secondary border border-border rounded-xl">
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
        <div className="relative bg-surface-secondary border border-border rounded-3xl p-8 sm:p-14 text-center overflow-hidden animate-fade-in">
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
