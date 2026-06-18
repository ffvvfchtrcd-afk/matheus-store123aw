import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { DatabaseContext } from '../../context/DatabaseContext'
import { getOrders } from '../../db/orderRepo'
import { getSubscribers } from '../../db/newsletterRepo'
import { formatCurrency } from '../../utils/formatCurrency'
import { getModels } from '../../db/modelRepo'
import { getTickets } from '../../db/ticketRepo'

export default function AdminDashboard() {
  const { ready } = useContext(DatabaseContext)
  const [orders, setOrders] = useState([])
  const [tickets, setTickets] = useState([])
  const [subscribers, setSubscribers] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    ;(async () => {
      try {
        const [ords, tckts, subs, prods] = await Promise.all([
          getOrders(),
          getTickets(),
          getSubscribers(),
          getModels({}),
        ])
        if (mounted) {
          setOrders(ords)
          setTickets(tckts)
          setSubscribers(subs?.length || 0)
          setProductCount(prods?.length || 0)
        }
      } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [ready])

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
  const pending = orders.filter((o) => o.status === 'confirmed' || o.status === 'processing')
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'answered')
  const lastOrders = orders.slice(0, 5)
  const lastOpenTickets = openTickets.slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface-secondary animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-secondary border border-border rounded-xl p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider">Receita Total</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <Link to="/admin/pedidos" className="bg-surface-secondary border border-border rounded-xl p-5 hover:border-text-muted transition-colors block">
          <p className="text-xs text-text-muted uppercase tracking-wider">Pedidos Hoje</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{todayOrders.length}</p>
        </Link>
        <Link to="/admin/pedidos" className="bg-surface-secondary border border-border rounded-xl p-5 hover:border-text-muted transition-colors block">
          <p className="text-xs text-text-muted uppercase tracking-wider">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-500 mt-1">{pending.length}</p>
        </Link>
        <Link to="/admin/produtos" className="bg-surface-secondary border border-border rounded-xl p-5 hover:border-text-muted transition-colors block">
          <p className="text-xs text-text-muted uppercase tracking-wider">Produtos</p>
          <p className="text-2xl font-bold text-accent mt-1">{productCount}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface-secondary border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Últimos Pedidos</h3>
            <Link to="/admin/pedidos" className="text-xs text-accent hover:underline">Ver todos</Link>
          </div>
          {lastOrders.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-2">
              {lastOrders.map((o) => (
                <Link key={o.orderNumber} to={`/admin/pedido/${encodeURIComponent(o.orderNumber)}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-text-secondary truncate">{o.orderNumber}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      o.status === 'confirmed' ? 'text-blue-500 bg-blue-500/10' :
                      o.status === 'processing' ? 'text-yellow-500 bg-yellow-500/10' :
                      o.status === 'shipped' ? 'text-accent bg-accent/10' :
                      'text-green-500 bg-green-500/10'
                    }`}>{o.status}</span>
                  </div>
                  <span className="text-xs font-medium text-text-primary">{formatCurrency(o.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-secondary border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Tickets Abertos</h3>
            <Link to="/admin/tickets" className="text-xs text-accent hover:underline">Ver todos</Link>
          </div>
          {lastOpenTickets.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhum ticket aberto.</p>
          ) : (
            <div className="space-y-2">
              {lastOpenTickets.map((t) => (
                <Link key={t.id} to={`/admin/tickets?ticket=${t.ticketNumber}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-text-secondary truncate">{t.ticketNumber}</span>
                    <span className="text-xs text-text-primary truncate max-w-[120px]">{t.subject}</span>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    t.status === 'open' ? 'text-blue-500 bg-blue-500/10' : 'text-yellow-500 bg-yellow-500/10'
                  }`}>{t.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-secondary border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Newsletter</h3>
            <Link to="/admin/newsletter" className="text-xs text-accent hover:underline">Ver todos</Link>
          </div>
          <p className="text-3xl font-bold text-text-primary mt-2">{subscribers}</p>
          <p className="text-xs text-text-muted mt-1">assinantes cadastrados</p>
        </div>
      </div>
    </div>
  )
}
