import { useState, useEffect, useRef, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { ArrowLeftIcon } from '../components/ui/Icons'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DatabaseContext } from '../context/DatabaseContext'
import { sendMessage, getMessagesByUser } from '../db/messageRepo'

export default function ChatPage() {
  const { ready } = useContext(DatabaseContext)
  const { user, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [started, setStarted] = useState(false)
  const [sending, setSending] = useState(false)
  const [adminTyping, setAdminTyping] = useState(false)
  const [dots, setDots] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      setUsername(user.username)
      setName(user.name)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!ready || !username) return
    const interval = setInterval(async () => {
      try { setMessages(await getMessagesByUser(username)) } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [ready, username])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, adminTyping, dots])

  useEffect(() => {
    if (!started || !username) return
    const interval = setInterval(() => {
      const last = messages[messages.length - 1]
      if (last && last.isAdmin && Date.now() - new Date(last.createdAt).getTime() < 5000) {
        setAdminTyping(true)
      } else {
        setAdminTyping(false)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [started, username, messages])

  useEffect(() => {
    if (!adminTyping) { setDots(''); return }
    const interval = setInterval(() => {
      setDots((prev) => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [adminTyping])

  const handleStart = async (e) => {
    e.preventDefault()
    if (!username || !name) return
    setStarted(true)
    try { setMessages(await getMessagesByUser(username)) } catch {}
  }

  const handleSend = async () => {
    if (!message.trim() || !username) return
    setSending(true)
    try {
      await sendMessage({ username, name, message: message.trim(), isAdmin: false })
      setMessage('')
      setMessages(await getMessagesByUser(username))
    } catch { addToast('Erro ao enviar mensagem', 'error') }
    setSending(false)
  }

  return (
    <Container className="py-8 max-w-2xl mx-auto">
      <Breadcrumb items={[{ label: 'Início', path: '/' }, { label: 'Fale Conosco' }]} />

      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-all">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Fale Conosco</h1>
      </div>

      {!started ? (
        <form onSubmit={handleStart} className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-text-secondary">Deixe sua mensagem que retornaremos em breve.</p>
          {!isAuthenticated && (
            <>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Usuário</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Escolha um identificador" className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors" />
              </div>
            </>
          )}
          {isAuthenticated && (
            <p className="text-sm text-text-secondary">Conectado como <span className="font-medium text-text-primary">{user.name}</span></p>
          )}
          <Button variant="primary" type="submit" disabled={!username || !name}>
            Iniciar Conversa
          </Button>
        </form>
      ) : (
        <div className="bg-surface-secondary border border-border rounded-xl flex flex-col h-[500px]">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium text-text-primary">Converse conosco</p>
            <p className="text-xs text-text-muted">{username}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-text-muted text-center pt-8">Envie sua primeira mensagem. Retornaremos em breve!</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.isAdmin ? 'bg-surface-tertiary text-text-primary rounded-bl-md' : 'bg-accent text-black rounded-br-md'
                }`}>
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-0.5 ${msg.isAdmin ? 'text-text-muted' : 'text-black/50'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {!msg.isAdmin && !msg.isRead && <span className="ml-1">✓</span>}
                    {!msg.isAdmin && msg.isRead && <span className="ml-1 text-green-600">✓✓</span>}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
            {adminTyping && <p className="text-xs text-text-muted italic">Atendente digitando{dots}</p>}
          </div>

          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !sending && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
              />
              <button onClick={handleSend} disabled={!message.trim() || sending} className="px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}
