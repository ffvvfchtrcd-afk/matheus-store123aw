import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PackageIcon, ArrowLeftIcon, UserIcon } from '../components/ui/Icons'
import { PackageIllustration } from '../components/ui/Illustrations'
import { formatCurrency } from '../utils/formatCurrency'
import { DatabaseContext } from '../context/DatabaseContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useCart } from '../hooks/useCart'
import { getOrdersByUser } from '../db/orderRepo'
import { getModelBySlug } from '../db/modelRepo'

const STATUS_LABELS = {
  confirmed: 'Confirmado', processing: 'Processando', shipped: 'Enviado', delivered: 'Entregue',
}
const STATUS_COLORS = {
  confirmed: 'text-blue-500 bg-blue-500/10', processing: 'text-yellow-500 bg-yellow-500/10',
  shipped: 'text-accent bg-accent/10', delivered: 'text-green-500 bg-green-500/10',
}

export default function OrderHistory() {
  const { ready } = useContext(DatabaseContext)
  const { isAuthenticated, user } = useAuth()
  const { dispatch } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready || !isAuthenticated) return
    let mounted = true; setLoading(true)
    ;(async () => {
      try { const r = await getOrdersByUser(user.username); if (mounted) setOrders(r) } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [ready, isAuthenticated, user])

  const handleReorder = async (order) => {
    let added = 0
    for (const item of order.items) {
      try {
        const model = await getModelBySlug(item.modelSlug)
        if (model) {
          const variant = (model.variants || []).find(
            (v) => v.size === item.size && v.color === item.color
          )
          if (variant && variant.stock > 0) {
            dispatch({ type: 'ADD_ITEM', payload: { model, variant, quantity: item.quantity } })
            added++
          }
        }
      } catch {}
    }
    if (added > 0) {
      addToast(`${added} item${added > 1 ? 's' : ''} adicionado${added > 1 ? 's' : ''} ao carrinho!`, 'success')
      navigate('/carrinho')
    } else {
      addToast('Nenhum item disponível para recompra.', 'info')
    }
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-20">
        <div className="text-center max-w-md mx-auto">
          <UserIcon className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Faça Login</h1>
          <p className="text-text-secondary mb-6">Entre na sua conta para ver seus pedidos.</p>
          <Button variant="primary" asChild><Link to="/entrar">Entrar</Link></Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Início', path: '/' }, { label: 'Meus Pedidos' }]} />
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Meus Pedidos</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface-secondary animate-pulse rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={PackageIllustration} title="Nenhum pedido encontrado" description="Você ainda não realizou nenhuma compra." actionLabel="Começar a Comprar" actionLink="/" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.orderNumber} className="bg-surface-secondary border border-border rounded-xl p-5 hover:border-text-muted transition-colors">
              <div className="flex items-start justify-between gap-4">
                <Link to={`/pedido/${encodeURIComponent(order.orderNumber)}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <PackageIcon className="w-5 h-5 text-accent/70 flex-shrink-0" />
                    <span className="font-medium text-text-primary">{order.orderNumber}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.confirmed}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{order.items.length} {order.items.length === 1 ? 'item' : 'itens'} — {formatCurrency(order.total)}</p>
                  <p className="text-xs text-text-muted mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </Link>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => handleReorder(order)} className="text-xs whitespace-nowrap">
                    Comprar Novamente
                  </Button>
                  <Link to={`/pedido/${encodeURIComponent(order.orderNumber)}`} className="text-xs text-accent hover:underline text-center">
                    Detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
