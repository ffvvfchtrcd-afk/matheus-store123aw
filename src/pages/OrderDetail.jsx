import { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { PackageIcon, MapPinIcon, TruckIcon, CreditCardIcon, ArrowLeftIcon } from '../components/ui/Icons'
import { ProductSearchIllustration } from '../components/ui/Illustrations'
import { formatCurrency } from '../utils/formatCurrency'
import { DatabaseContext } from '../context/DatabaseContext'
import { useToast } from '../context/ToastContext'
import { useCart } from '../hooks/useCart'
import { getOrderByNumber, updateOrderStatus } from '../db/orderRepo'
import { getModelBySlug } from '../db/modelRepo'

const STATUS_LABELS = {
  confirmed: 'Confirmado',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
}

const STATUS_COLORS = {
  confirmed: 'text-blue-500 bg-blue-500/10',
  processing: 'text-yellow-500 bg-yellow-500/10',
  shipped: 'text-accent bg-accent/10',
  delivered: 'text-green-500 bg-green-500/10',
}

export default function OrderDetail() {
  const { numero } = useParams()
  const { ready } = useContext(DatabaseContext)
  const { addToast } = useToast()
  const { dispatch } = useCart()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready || !numero) return
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const result = await getOrderByNumber(numero)
        if (mounted) setOrder(result)
      } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [ready, numero])

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return
    try {
      await updateOrderStatus(order.orderNumber, 'cancelled')
      setOrder((prev) => ({ ...prev, status: 'cancelled' }))
      addToast('Pedido cancelado.', 'info')
    } catch {
      addToast('Erro ao cancelar pedido.', 'error')
    }
  }

  const handleReorder = async () => {
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

  if (loading) {
    return (
      <Container className="py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </Container>
    )
  }

  if (!order) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={ProductSearchIllustration}
          title="Pedido não encontrado"
          description="O pedido que você procura não existe."
          actionLabel="Ver Meus Pedidos"
          actionLink="/pedidos"
        />
      </Container>
    )
  }

  const paymentLabel = order.payment.method === 'credit'
    ? `Cartão de Crédito final ${order.payment.cardLastDigits}`
    : order.payment.method === 'boleto' ? 'Boleto Bancário' : 'PIX'

  const canCancel = ['confirmed', 'processing'].includes(order.status)
  const canReorder = order.status !== 'cancelled'

  return (
    <Container className="py-8">
      <Breadcrumb items={[
        { label: 'Início', path: '/' },
        { label: 'Meus Pedidos', path: '/pedidos' },
        { label: order.orderNumber },
      ]} />

      <div className="flex items-center gap-3 mb-8">
        <Link to="/pedidos" className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{order.orderNumber}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.confirmed} ${order.status === 'cancelled' ? 'text-red-500 bg-red-500/10' : ''}`}>
              {STATUS_LABELS[order.status] || order.status === 'cancelled' ? 'Cancelado' : order.status}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {canReorder && (
            <Button variant="secondary" size="sm" onClick={handleReorder} className="text-xs">
              Comprar Novamente
            </Button>
          )}
          {canCancel && (
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs text-red-400 hover:bg-red-500/10">
              Cancelar Pedido
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <PackageIcon className="w-4 h-4 text-accent/70" />
              Itens do Pedido
            </h3>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="w-14 h-14 rounded-lg bg-surface-tertiary overflow-hidden flex-shrink-0">
                    {item.image?.startsWith('http') && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.size} / {item.color} — qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <MapPinIcon className="w-4 h-4 text-accent/70" />
              Endereço de Entrega
            </h3>
            <div className="text-sm text-text-secondary space-y-1">
              <p>{order.address.logradouro}, {order.address.numero}{order.address.complemento ? ` - ${order.address.complemento}` : ''}</p>
              <p>{order.address.bairro} - {order.address.cidade}/{order.address.estado}</p>
              <p>CEP: {order.address.cep}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Resumo</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Frete</span>
                <span className={order.shippingCost === 0 ? 'text-green-500' : ''}>
                  {order.shippingCost === 0 ? 'Grátis' : formatCurrency(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-text-primary border-t border-border pt-2">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-accent/70" />
              Frete
            </h3>
            <p className="text-sm text-text-secondary">{order.shipping.method}</p>
            <p className="text-xs text-text-muted">{order.shipping.days}</p>
          </div>

          <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4 text-accent/70" />
              Pagamento
            </h3>
            <p className="text-sm text-text-secondary">{paymentLabel}</p>
            <p className="text-xs text-text-muted">
              CPF: {order.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3.$4')}
            </p>
          </div>
        </div>
      </div>
    </Container>
  )
}
