import { useState, useEffect, useContext, useRef } from 'react'
import { DatabaseContext } from '../../context/DatabaseContext'
import { useToast } from '../../context/ToastContext'
import { getTickets, getTicketMessages, updateTicketStatus, updateTicketPriority, addTicketReply } from '../../db/ticketRepo'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'

const CATEGORIES = [
  { value: 'reclamacao', label: 'Reclamação' },
  { value: 'troca', label: 'Troca / Devolução' },
  { value: 'duvida', label: 'Dúvida sobre Produto' },
  { value: 'cancelamento', label: 'Cancelamento' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'outro', label: 'Outro' },
]

const STATUS_FLOW = ['open', 'in_progress', 'answered', 'resolved', 'closed']

const STATUS_LABELS = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  answered: 'Respondido',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

const STATUS_COLORS = {
  open: 'text-blue-500 bg-blue-500/10',
  in_progress: 'text-yellow-500 bg-yellow-500/10',
  answered: 'text-accent bg-accent/10',
  resolved: 'text-green-500 bg-green-500/10',
  closed: 'text-text-muted bg-surface-tertiary',
}

const PRIORITY_COLORS = {
  low: 'text-text-muted',
  normal: 'text-text-secondary',
  high: 'text-red-400',
}

function TicketsList({ tickets, onSelect, onRefresh }) {
  const { addToast } = useToast()
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = tickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false
    if (catFilter && t.category !== catFilter) return false
    return true
  })

  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(filtered, 15)

  const handleBulkStatus = async (newStatus) => {
    if (!selectedIds.size) return
    let count = 0
    for (const id of selectedIds) {
      try { await updateTicketStatus(id, newStatus); count++ } catch {}
    }
    addToast(`${count} ticket${count > 1 ? 's' : ''} atualizado${count > 1 ? 's' : ''}.`, 'success')
    setSelectedIds(new Set())
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); goToPage(1) }}
          className="px-3 py-1.5 text-xs bg-surface-tertiary border border-border rounded-lg text-text-primary focus:outline-none">
          <option value="">Todos os Status</option>
          {STATUS_FLOW.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); goToPage(1) }}
          className="px-3 py-1.5 text-xs bg-surface-tertiary border border-border rounded-lg text-text-primary focus:outline-none">
          <option value="">Todas as Categorias</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">Nenhum ticket encontrado.</p>
      ) : (
        <div className="space-y-2">
          {paginatedItems.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="w-full text-left bg-surface-secondary border border-border rounded-xl p-4 hover:border-text-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-accent/70">{t.ticketNumber}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[t.status] || STATUS_COLORS.open}`}>
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                    <span className={`text-xs ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.normal}`}>
                      {t.priority === 'high' ? '🔴 Alta' : t.priority === 'low' ? '🟢 Baixa' : '⚪ Normal'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">{t.subject}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t.name || t.username} — {CATEGORIES.find((c) => c.value === t.category)?.label || t.category}
                    {t.orderNumber && ` — ${t.orderNumber}`}
                  </p>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  )
}

function TicketDetailView({ ticketId, onBack }) {
  const { addToast } = useToast()
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    if (!ticketId) return
    try {
      const { getTicketById } = await import('../../db/ticketRepo')
      const t = await getTicketById(ticketId)
      setTicket(t)
      const msgs = await getTicketMessages(ticketId)
      setMessages(msgs)
    } catch {}
  }

  useEffect(() => { load() }, [ticketId])

  useEffect(() => {
    if (!ticketId) return
    const interval = setInterval(load, 4000)
    return () => clearInterval(interval)
  }, [ticketId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicketStatus(ticket.id, newStatus)
      setTicket((prev) => ({ ...prev, status: newStatus }))
      addToast(`Status alterado para "${STATUS_LABELS[newStatus]}".`, 'success')
    } catch {
      addToast('Erro ao alterar status.', 'error')
    }
  }

  const handlePriorityChange = async (priority) => {
    try {
      await updateTicketPriority(ticket.id, priority)
      setTicket((prev) => ({ ...prev, priority }))
      addToast(`Prioridade alterada.`, 'success')
    } catch {
      addToast('Erro ao alterar prioridade.', 'error')
    }
  }

  const handleSendReply = async () => {
    if (!reply.trim() || !ticket) return
    setSending(true)
    try {
      await addTicketReply({
        ticketId: ticket.id,
        username: ticket.username,
        name: ticket.name,
        message: reply.trim(),
        isAdmin: true,
      })
      setReply('')
      await load()
    } catch { addToast('Erro ao enviar resposta', 'error') }
    setSending(false)
  }

  if (!ticket) return <p className="text-text-muted text-center py-8">Carregando...</p>

  return (
    <div className="flex h-[calc(100vh-160px)] -m-6">
      <div className="w-72 border-r border-border bg-surface-secondary flex-shrink-0 overflow-y-auto p-4 space-y-4">
        <button onClick={onBack} className="text-xs text-text-muted hover:text-text-primary transition-colors mb-2">
          ← Voltar à lista
        </button>

        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Ticket</h3>
          <p className="text-sm font-mono text-accent">{ticket.ticketNumber}</p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Cliente</h3>
          <p className="text-sm text-text-primary">{ticket.name || ticket.username}</p>
          <p className="text-xs text-text-muted">@{ticket.username}</p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Categoria</h3>
          <p className="text-sm text-text-secondary">{CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category}</p>
        </div>

        {ticket.orderNumber && (
          <div>
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pedido</h3>
            <p className="text-sm font-mono text-text-secondary">{ticket.orderNumber}</p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Aberto em</h3>
          <p className="text-sm text-text-secondary">
            {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Status</h3>
          <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)}
            className={`w-full text-sm font-medium px-2 py-1.5 rounded-lg border border-border bg-surface-tertiary focus:outline-none ${STATUS_COLORS[ticket.status] || ''}`}>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>

        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">Prioridade</h3>
          <select value={ticket.priority} onChange={(e) => handlePriorityChange(e.target.value)}
            className="w-full text-sm px-2 py-1.5 rounded-lg border border-border bg-surface-tertiary text-text-primary focus:outline-none">
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-surface-secondary">
          <h2 className="text-base font-bold text-text-primary">{ticket.subject}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.isAdmin ? 'bg-accent text-black rounded-br-md' : 'bg-surface-tertiary text-text-primary rounded-bl-md'
              }`}>
                {!msg.isAdmin && <p className="text-xs font-medium text-text-muted mb-0.5">{msg.name}</p>}
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p className={`text-xs mt-0.5 ${msg.isAdmin ? 'text-black/50' : 'text-text-muted'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-border bg-surface-secondary">
          <div className="flex gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !sending && handleSendReply()}
              placeholder="Digite sua resposta como atendente..."
              rows={2}
              className="flex-1 px-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors resize-none"
            />
            <button
              onClick={handleSendReply}
              disabled={!reply.trim() || sending}
              className="self-end px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              {sending ? '...' : 'Responder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminTickets() {
  const { ready } = useContext(DatabaseContext)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTicketId, setActiveTicketId] = useState(null)

  const loadTickets = async () => {
    if (!ready) return
    try {
      const t = await getTickets({})
      setTickets(t || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadTickets() }, [ready])

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-secondary animate-pulse rounded-xl" />)}</div>
  }

  if (activeTicketId) {
    return <TicketDetailView ticketId={activeTicketId} onBack={() => { setActiveTicketId(null); loadTickets() }} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Tickets de Suporte</h2>
        <span className="text-xs text-text-muted">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
      </div>
      <TicketsList tickets={tickets} onSelect={(id) => setActiveTicketId(id)} onRefresh={loadTickets} />
    </div>
  )
}
