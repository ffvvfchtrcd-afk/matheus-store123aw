import { useState, useEffect, useContext, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { ArrowLeftIcon, PackageIcon } from '../components/ui/Icons'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DatabaseContext } from '../context/DatabaseContext'
import { createTicket, getTicketsByUser, getTicketById, getTicketMessages, addTicketReply } from '../db/ticketRepo'
import { getOrdersByUser } from '../db/orderRepo'

const CATEGORIES = [
  { value: 'reclamacao', label: 'Reclamação' },
  { value: 'troca', label: 'Troca / Devolução' },
  { value: 'duvida', label: 'Dúvida sobre Produto' },
  { value: 'cancelamento', label: 'Cancelamento' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'outro', label: 'Outro' },
]

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

function TicketForm({ onCreated }) {
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const { ready } = useContext(DatabaseContext)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [description, setDescription] = useState('')
  const [orders, setOrders] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!ready || !isAuthenticated || !user) return
    ;(async () => {
      try {
        const ords = await getOrdersByUser(user.username)
        setOrders(ords || [])
      } catch {}
    })()
  }, [ready, isAuthenticated, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (subject.trim().length < 10) {
      addToast('O assunto deve ter pelo menos 10 caracteres.', 'error')
      return
    }
    if (!category) {
      addToast('Selecione uma categoria.', 'error')
      return
    }
    if (!description.trim()) {
      addToast('Descreva o motivo do ticket.', 'error')
      return
    }
    setSaving(true)
    try {
      const ticket = await createTicket({
        username: user.username,
        name: user.name,
        subject: subject.trim(),
        category,
        orderNumber: orderNumber || null,
        description: description.trim(),
      })
      addToast(`Ticket ${ticket.ticketNumber} criado com sucesso!`, 'success')
      onCreated?.(ticket.id)
    } catch (err) {
      addToast('Erro ao criar ticket: ' + err.message, 'error')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Abrir Ticket</h2>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Categoria</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-muted transition-colors">
          <option value="">Selecione...</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {orders.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Pedido (opcional)</label>
          <select value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-muted transition-colors">
            <option value="">Nenhum</option>
            {orders.map((o) => (
              <option key={o.orderNumber} value={o.orderNumber}>
                {o.orderNumber} — {o.items?.length || 0} itens
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">
          Assunto <span className="text-red-400">* mínimo 10 caracteres</span>
        </label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: Produto veio com defeito"
          className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
        />
        {subject.length > 0 && subject.length < 10 && (
          <p className="text-xs text-red-400 mt-1">Faltam {10 - subject.length} caracteres</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Descrição</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva detalhadamente o motivo do seu contato..."
          rows={4}
          className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors resize-none"
        />
      </div>

      <Button variant="primary" type="submit" disabled={saving || subject.trim().length < 10 || !category}>
        {saving ? 'Criando...' : 'Criar Ticket'}
      </Button>
    </form>
  )
}

function TicketList({ tickets, onSelect }) {
  return (
    <div className="space-y-3">
      {tickets.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">Nenhum ticket ainda. Crie um para começar.</p>
      ) : (
        tickets.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="w-full text-left bg-surface-secondary border border-border rounded-xl p-4 hover:border-text-muted transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-text-muted">{t.ticketNumber}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[t.status] || STATUS_COLORS.open}`}>
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate">{t.subject}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {CATEGORIES.find((c) => c.value === t.category)?.label || t.category}
                  {t.orderNumber && ` — ${t.orderNumber}`}
                </p>
              </div>
              <span className="text-xs text-text-muted flex-shrink-0">
                {new Date(t.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  )
}

function TicketDetail({ ticketId, onBack }) {
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    if (!ticketId) return
    try {
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

  const canClose = ticket && (ticket.status === 'resolved' || ticket.status === 'answered' || ticket.status === 'in_progress')
  const canReopen = ticket && ticket.status === 'closed'

  const handleSendReply = async () => {
    if (!reply.trim() || !ticket) return
    setSending(true)
    try {
      await addTicketReply({
        ticketId: ticket.id,
        username: user.username,
        name: user.name,
        message: reply.trim(),
        isAdmin: false,
      })
      setReply('')
      await load()
    } catch { addToast('Erro ao enviar resposta', 'error') }
    setSending(false)
  }

  const handleClose = async () => {
    try {
      const { updateTicketStatus } = await import('../db/ticketRepo')
      await updateTicketStatus(ticket.id, 'closed')
      addToast('Ticket fechado.', 'info')
      await load()
    } catch {}
  }

  const handleReopen = async () => {
    try {
      const { updateTicketStatus } = await import('../db/ticketRepo')
      await updateTicketStatus(ticket.id, 'open')
      addToast('Ticket reaberto.', 'success')
      await load()
    } catch {}
  }

  if (!ticket) return <p className="text-text-muted text-center py-8">Carregando...</p>

  return (
    <div className="bg-surface-secondary border border-border rounded-xl flex flex-col h-[600px]">
      <div className="p-4 border-b border-border flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-text-muted">{ticket.ticketNumber}</span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[ticket.status] || STATUS_COLORS.open}`}>
              {STATUS_LABELS[ticket.status] || ticket.status}
            </span>
            {ticket.priority === 'high' && <span className="text-xs text-red-400 font-medium">Alta prioridade</span>}
          </div>
          <h2 className="text-base font-bold text-text-primary">{ticket.subject}</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category}
            {ticket.orderNumber && ` — Pedido ${ticket.orderNumber}`}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Aberto em {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {canReopen && (
            <Button size="sm" variant="secondary" onClick={handleReopen} className="text-xs">Reabrir</Button>
          )}
          {canClose && (
            <Button size="sm" variant="ghost" onClick={handleClose} className="text-xs text-text-muted">Fechar</Button>
          )}
          <Button size="sm" variant="ghost" onClick={onBack} className="text-xs">
            <ArrowLeftIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.isAdmin ? 'bg-surface-tertiary text-text-primary rounded-bl-md' : 'bg-accent text-black rounded-br-md'
            }`}>
              {msg.isAdmin && <p className="text-xs font-medium text-accent/70 mb-0.5">Atendente</p>}
              <p className="whitespace-pre-wrap">{msg.message}</p>
              <p className={`text-xs mt-0.5 ${msg.isAdmin ? 'text-text-muted' : 'text-black/50'}`}>
                {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {!msg.isAdmin && !msg.isRead && <span className="ml-1">✓</span>}
                {!msg.isAdmin && msg.isRead && <span className="ml-1 text-green-600">✓✓</span>}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !sending && handleSendReply()}
              placeholder="Digite sua resposta... (Enter para enviar)"
              rows={2}
              className="flex-1 px-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors resize-none"
            />
            <button
              onClick={handleSendReply}
              disabled={!reply.trim() || sending}
              className="self-end px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              {sending ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SupportPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { ready } = useContext(DatabaseContext)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTicketId, setActiveTicketId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const loadTickets = async () => {
    if (!ready || !isAuthenticated || !user) return
    setLoading(true)
    try {
      const t = await getTicketsByUser(user.username)
      setTickets(t || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadTickets() }, [ready, isAuthenticated, user])

  useEffect(() => {
    if (ticketId) {
      const id = Number(ticketId)
      setActiveTicketId(id)
      setShowForm(false)
    }
  }, [ticketId])

  const handleCreated = (id) => {
    setShowForm(false)
    setActiveTicketId(id)
    navigate(`/fale-conosco/${id}`, { replace: true })
    loadTickets()
  }

  const handleSelect = (id) => {
    setActiveTicketId(id)
    navigate(`/fale-conosco/${id}`, { replace: true })
  }

  const handleBack = () => {
    setActiveTicketId(null)
    setShowForm(false)
    navigate('/fale-conosco', { replace: true })
    loadTickets()
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-20 max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Suporte</h1>
          <p className="text-text-secondary mb-6">Faça login para abrir um ticket de suporte.</p>
          <Button variant="primary" asChild><Link to="/entrar?redirect=/fale-conosco">Entrar</Link></Button>
        </div>
      </Container>
    )
  }

  const activeTicket = activeTicketId && tickets.find((t) => t.id === activeTicketId)

  return (
    <Container className="py-8 max-w-3xl mx-auto">
      <Breadcrumb items={[
        { label: 'Início', path: '/' },
        { label: activeTicket ? `Ticket ${activeTicket.ticketNumber}` : 'Fale Conosco' },
      ]} />

      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          {activeTicketId && (
            <button onClick={handleBack} className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Fale Conosco</h1>
            <p className="text-sm text-text-secondary">Abertura de tickets de suporte</p>
          </div>
        </div>
        {!activeTicketId && !showForm && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            Novo Ticket
          </Button>
        )}
      </div>

      {activeTicketId && activeTicket ? (
        <TicketDetail ticketId={activeTicketId} onBack={handleBack} />
      ) : showForm ? (
        <TicketForm onCreated={handleCreated} />
      ) : (
        <>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-secondary animate-pulse rounded-xl" />)}
            </div>
          ) : (
            <TicketList tickets={tickets} onSelect={handleSelect} />
          )}
        </>
      )}
    </Container>
  )
}
