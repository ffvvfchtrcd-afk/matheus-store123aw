import { useState, useEffect, useContext, useRef } from 'react'
import { DatabaseContext } from '../../context/DatabaseContext'
import { getAllConversations, getMessagesByUser, sendMessage, markAsRead } from '../../db/messageRepo'

function TypingIndicator({ username }) {
  const [typing, setTyping] = useState(false)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!typing) return
    const interval = setInterval(() => {
      setDots((prev) => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [typing])

  useEffect(() => {
    if (!username) return
    const interval = setInterval(async () => {
      const msgs = await getMessagesByUser(username)
      const last = msgs?.[msgs.length - 1]
      if (last && !last.isAdmin) {
        setTyping(true)
        setTimeout(() => setTyping(false), 3000)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [username])

  if (!typing) return null
  return <p className="text-xs text-text-muted italic mt-1">Digitando{dots}</p>
}

export default function AdminChat() {
  const { ready } = useContext(DatabaseContext)
  const [conversations, setConversations] = useState([])
  const [activeUsername, setActiveUsername] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!ready) return
    loadConversations()
    const interval = setInterval(loadConversations, 5000)
    return () => clearInterval(interval)
  }, [ready])

  useEffect(() => {
    if (!activeUsername) return
    loadMessages(activeUsername)
    markAsRead(activeUsername)
    const interval = setInterval(() => loadMessages(activeUsername), 3000)
    return () => clearInterval(interval)
  }, [activeUsername])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadConversations = async () => {
    try { setConversations(await getAllConversations()) } catch {}
    setLoading(false)
  }

  const loadMessages = async (username) => {
    try { setMessages(await getMessagesByUser(username)) } catch {}
  }

  const handleSend = async () => {
    if (!input.trim() || !activeUsername) return
    const conv = conversations.find((c) => c.username === activeUsername)
    await sendMessage({ username: activeUsername, name: conv?.name || activeUsername, message: input.trim(), isAdmin: true })
    setInput('')
    loadMessages(activeUsername)
    loadConversations()
  }

  if (loading) return <div className="h-64 bg-surface-secondary animate-pulse rounded-xl" />

  return (
    <div className="flex h-[calc(100vh-160px)] -m-6">
      <div className="w-64 border-r border-border bg-surface-secondary flex-shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Conversas</h3>
        </div>
        {conversations.length === 0 ? (
          <p className="p-4 text-xs text-text-muted">Nenhuma conversa.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.username}
              onClick={() => setActiveUsername(c.username)}
              className={`w-full text-left px-3 py-3 border-b border-border transition-colors ${
                activeUsername === c.username ? 'bg-surface-hover' : 'hover:bg-surface-tertiary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary truncate">{c.name || c.username}</span>
                {c.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{c.unread}</span>
                )}
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">{c.lastMessage?.message}</p>
            </button>
          ))
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {activeUsername ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-xs text-text-muted text-center pb-2 border-b border-border">{activeUsername}</div>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.isAdmin ? 'bg-accent text-black rounded-br-md' : 'bg-surface-tertiary text-text-primary rounded-bl-md'
                  }`}>
                    <p>{msg.message}</p>
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
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua resposta..."
                  className="flex-1 px-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                />
                <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-2 bg-accent text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30">
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-text-muted">Selecione uma conversa</div>
        )}
      </div>
    </div>
  )
}
