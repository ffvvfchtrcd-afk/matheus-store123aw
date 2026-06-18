import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { DatabaseContext } from '../../context/DatabaseContext'
import { useToast } from '../../context/ToastContext'
import { getOrders, updateOrderStatus } from '../../db/orderRepo'
import { formatCurrency } from '../../utils/formatCurrency'
import { exportOrdersCSV } from '../../utils/csv'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'

const STATUS_FLOW = ['confirmed', 'processing', 'shipped', 'delivered']

const STATUS_LABELS = {
  confirmed: 'Confirmado', processing: 'Processando', shipped: 'Enviado', delivered: 'Entregue',
}

const STATUS_COLORS = {
  confirmed: 'text-blue-500 bg-blue-500/10',
  processing: 'text-yellow-500 bg-yellow-500/10',
  shipped: 'text-accent bg-accent/10',
  delivered: 'text-green-500 bg-green-500/10',
}

export default function AdminOrders() {
  const { ready } = useContext(DatabaseContext)
  const { addToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkStatus, setBulkStatus] = useState('')

  const filtered = filter === 'todos' ? orders : orders.filter((o) => o.status === filter)
  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(filtered, 15)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    ;(async () => {
      try {
        const result = await getOrders()
        if (mounted) setOrders(result)
      } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [ready])

  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      await updateOrderStatus(orderNumber, newStatus)
      setOrders((prev) => prev.map((o) => o.orderNumber === orderNumber ? { ...o, status: newStatus } : o))
      addToast(`Pedido ${orderNumber} atualizado para "${STATUS_LABELS[newStatus]}"`, 'success')
    } catch {
      addToast('Erro ao atualizar status', 'error')
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === paginatedItems.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedItems.map((o) => o.orderNumber)))
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return
    let count = 0
    for (const id of selectedIds) {
      try {
        await updateOrderStatus(id, bulkStatus)
        setOrders((prev) => prev.map((o) => o.orderNumber === id ? { ...o, status: bulkStatus } : o))
        count++
      } catch {}
    }
    addToast(`${count} pedido${count > 1 ? 's' : ''} atualizado${count > 1 ? 's' : ''} para "${STATUS_LABELS[bulkStatus]}".`, 'success')
    setSelectedIds(new Set())
    setBulkStatus('')
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface-secondary animate-pulse rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Pedidos</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportOrdersCSV(orders)} className="text-xs">
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {['todos', 'confirmed', 'processing', 'shipped', 'delivered'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); goToPage(1); setSelectedIds(new Set()) }}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              filter === s ? 'bg-accent text-black border-accent' : 'border-border text-text-secondary hover:border-text-muted'
            }`}
          >
            {s === 'todos' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <span className="text-xs text-text-muted">{selectedIds.size} selecionado(s)</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-2 py-1 text-xs bg-surface-tertiary border border-border rounded text-text-primary"
            >
              <option value="">Alterar status...</option>
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <Button variant="primary" size="sm" onClick={handleBulkUpdate} disabled={!bulkStatus} className="text-xs">
              Aplicar
            </Button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhum pedido encontrado.</p>
      ) : (
        <div className="bg-surface-secondary border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={selectedIds.size === paginatedItems.length && paginatedItems.length > 0} onChange={toggleAll} className="accent-accent" />
                </th>
                <th className="text-left px-4 py-3 font-medium">Pedido</th>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-left px-4 py-3 font-medium">Itens</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.map((o) => (
                <tr key={o.orderNumber} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(o.orderNumber)} onChange={() => toggleSelect(o.orderNumber)} className="accent-accent" />
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/pedido/${encodeURIComponent(o.orderNumber)}`} className="text-accent hover:underline font-mono text-xs">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{o.username || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{o.items?.length || 0}</td>
                  <td className="px-4 py-3 text-right text-text-primary font-medium">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.orderNumber, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border border-border bg-surface-tertiary focus:outline-none ${STATUS_COLORS[o.status] || ''}`}
                    >
                      {STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  )
}
