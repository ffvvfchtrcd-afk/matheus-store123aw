import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { ModelCard } from '../components/product/ModelCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ProductGridSkeleton } from '../components/ui/Skeleton'
import { HeartIcon, ArrowLeftIcon, UserIcon } from '../components/ui/Icons'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { DatabaseContext } from '../context/DatabaseContext'
import { getModelBySlug } from '../db/modelRepo'

export default function WishlistPage() {
  const { isAuthenticated } = useAuth()
  const { wishlistSlugs } = useWishlist()
  const { ready } = useContext(DatabaseContext)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const results = await Promise.all(
          (wishlistSlugs || []).map((slug) => getModelBySlug(slug))
        )
        if (mounted) setModels(results.filter(Boolean))
      } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [ready, wishlistSlugs])

  if (!isAuthenticated) {
    return (
      <Container className="py-20">
        <div className="text-center max-w-md mx-auto">
          <UserIcon className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Faça Login</h1>
          <p className="text-text-secondary mb-6">Entre na sua conta para ver seus favoritos.</p>
          <Button variant="primary" asChild><Link to="/entrar">Entrar</Link></Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Início', path: '/' }, { label: 'Favoritos' }]} />
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Favoritos</h1>
          {!loading && <span className="text-sm text-text-muted">({wishlistSlugs.length})</span>}
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : models.length === 0 ? (
        <EmptyState
          icon={() => <HeartIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />}
          title="Nenhum favorito"
          description="Você ainda não favoritou nenhum produto."
          actionLabel="Explorar Produtos"
          actionLink="/"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <ModelCard key={model.slug} model={model} />
          ))}
        </div>
      )}
    </Container>
  )
}
