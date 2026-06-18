import { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DatabaseContext } from '../../context/DatabaseContext'
import { useToast } from '../../context/ToastContext'
import { getOrderByNumber, updateOrderStatus } from '../../db/orderRepo'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../../components/ui/Button'

const STATUS_FLOW = ['confirmed', 'processing', 'shipped', 'delivered']
const STATUS_LABELS = { confirmed: 'Confirmado', processing: 'Processando', shipped: 'Enviado', delivered: 'Entregue' }
const STATUS_COLORS = {
  confirmed: 'text-blue-500 bg-blue-500/10',
  processing: 'text-yellow-500 bg-yellow-500/10',
  shipped: 'text-accent bg-accent/10',
  delivered: 'text-green-500 bg-green-500/10',
}

export default function AdminOrderDetail() {
  const { numero } = useParams()
  const { ready } = useContext(DatabaseContext)
  const { addToast } = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready || !numero) return
    let mounted = true
    ;(async () => {
      try {
        const result = await getOrderByNumber(numero)
        if (mounted) setOrder(result)
      } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [ready, numero])

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(order.orderNumber, newStatus)
      setOrder((prev) => ({ ...prev, status: newStatus }))
      addToast(`Status atualizado para "${STATUS_LABELS[newStatus]}"`, 'success')
    } catch {
      addToast('Erro ao atualizar status', 'error')
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancelar este pedido?')) return
    await handleStatusChange('cancelled')
  }

  if (loading) {
    return <div className="h-48 bg-surface-secondary animate-pulse rounded-xl" />
  }

  if (!order) {
    return <p className="text-text-muted">Pedido não encontrado.</p>
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status)
  const paymentLabel = order.payment?.method === 'credit'
    ? `Cartão de Crédito final ${order.payment.cardLastDigits}`
    : order.payment?.method === 'boleto' ? 'Boleto Bancário' : 'PIX'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/pedidos" className="text-xs text-text-muted hover:text-text-primary transition-colors">
            ← Voltar
          </Link>
          <h2 className="text-xl font-bold text-text-primary">{order.orderNumber}</h2>
          {order.status === 'cancelled' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-red-500 bg-red-500/10">Cancelado</span>
          )}
        </div>
        {order.status !== 'cancelled' && (
          <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs text-red-400 hover:bg-red-500/10">
            Cancelar Pedido
          </Button>
        )}
      </div>

      {order.status !== 'cancelled' ? (
        <div className="bg-surface-secondary border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Status</h3>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border border-border bg-surface-tertiary focus:outline-none ${STATUS_COLORS[order.status] || ''}`}
            >
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= currentIdx ? 'bg-accent text-black' : 'bg-surface-tertiary text-text-muted'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs ${i <= currentIdx ? 'text-text-primary' : 'text-text-muted'}`}>{STATUS_LABELS[s]}</span>
                {i < STATUS_FLOW.length - 1 && <div className={`flex-1 h-0.5 ${i < currentIdx ? 'bg-accent' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface-secondary border border-red-500/20 rounded-xl p-5">
          <p className="text-sm text-red-400">Este pedido foi cancelado.</p>
        </div>
      )}

      <div className="bg-surface-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Cliente</h3>
        <p className="text-sm text-text-secondary">Usuário: {order.username || 'Não informado'}</p>
        <p className="text-sm text-text-secondary">CPF: {order.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3.$4')}</p>
      </div>

      <div className="bg-surface-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Itens</h3>
        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.variantId} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm text-text-primary">{item.name}</p>
                <p className="text-xs text-text-muted">{item.size} / {item.color} × {item.quantity}</p>
              </div>
              <span className="text-sm text-text-primary font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-secondary border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Endereço</h3>
          <p className="text-sm text-text-secondary">{order.address?.logradouro}, {order.address?.numero}</p>
          {order.address?.complemento && <p className="text-sm text-text-secondary">{order.address.complemento}</p>}
          <p className="text-sm text-text-secondary">{order.address?.bairro} - {order.address?.cidade}/{order.address?.estado}</p>
          <p className="text-sm text-text-secondary">CEP: {order.address?.cep}</p>
        </div>
        <div className="space-y-4">
          <div className="bg-surface-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Frete</h3>
            <p className="text-sm text-text-secondary">{order.shipping?.method}</p>
            <p className="text-sm text-text-secondary">{formatCurrency(order.shippingCost)}</p>
          </div>
          <div className="bg-surface-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Pagamento</h3>
            <p className="text-sm text-text-secondary">{paymentLabel}</p>
          </div>
          <div className="bg-surface-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Resumo</h3>
            <div className="flex justify-between text-sm text-text-secondary"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between text-sm text-text-secondary"><span>Frete</span><span>{order.shippingCost === 0 ? 'Grátis' : formatCurrency(order.shippingCost)}</span></div>
            <div className="flex justify-between text-sm font-bold text-text-primary border-t border-border pt-1 mt-1">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
