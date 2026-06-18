import { useState, useEffect, useContext } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DatabaseContext } from '../../context/DatabaseContext'
import { getUnreadTicketCount } from '../../db/ticketRepo'
import { Logotype } from '../../components/ui/Icons'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '📦' },
  { to: '/admin/produtos', label: 'Produtos', icon: '👕' },
  { to: '/admin/categorias', label: 'Categorias', icon: '🏷️' },
  { to: '/admin/newsletter', label: 'Newsletter', icon: '📧' },
  { to: '/admin/tickets', label: 'Tickets', icon: '🎫' },
]

export function AdminLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user?.isAdmin) return
    const interval = setInterval(async () => {
      try { setUnread(await getUnreadTicketCount()) } catch {}
    }, 5000)
    getUnreadTicketCount().then(setUnread).catch(() => {})
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/', { replace: true })
    }
  }, [loading, isAuthenticated, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) return null

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-56 bg-surface-secondary border-r border-accent/25 shadow-[2px_0_15px_rgba(232,184,74,0.08)] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="inline-block">
            <Logotype className="h-5" />
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const isActive = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  isActive ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Tickets' && unread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unread}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors">
            ← Voltar ao Site
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-surface-secondary flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-sm font-semibold text-text-primary">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-secondary">{user.name}</span>
            <button onClick={() => { logout(); navigate('/') }} className="text-xs text-text-muted hover:text-red-400 transition-colors">
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
