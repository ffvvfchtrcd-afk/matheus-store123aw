import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import { CloseIcon, CartIcon, PackageIcon, UserIcon, HeartIcon as Heart } from '../ui/Icons'
import categories from '../../data/categories.json'

export function MobileMenu({ open, onClose }) {
  const { totalItems } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => { onClose() }, [location.pathname])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-border animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-bold text-text-primary">Menu</span>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {isAuthenticated && (
            <div className="pb-4 border-b border-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <UserIcon className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-muted">@{user.username}</p>
                </div>
              </div>
            </div>
          )}

          <Link to="/ofertas" className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-400 hover:bg-surface-tertiary rounded-lg transition-colors">
            <span className="text-lg">🏷️</span>
            Ofertas
          </Link>

          {categories.map((cat) => (
            <div key={cat.slug}>
              <Link to={`/${cat.slug}`} className={`block text-base font-semibold mb-2 ${location.pathname.startsWith(`/${cat.slug}`) ? 'text-text-primary' : 'text-text-secondary'}`}>
                {cat.label}
              </Link>
              <div className="ml-4 space-y-1">
                {cat.subcategories.map((sub) => (
                  <Link key={sub.slug} to={`/${cat.slug}/${sub.slug}`} className={`block px-3 py-2 text-sm rounded-lg transition-colors ${location.pathname === `/${cat.slug}/${sub.slug}` ? 'bg-surface-hover text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-surface-tertiary'}`}>
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border space-y-1">
            <Link to="/favoritos" className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-colors">
              <Heart className="w-5 h-5" />
              Favoritos
            </Link>
            <Link to="/fale-conosco" className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-colors">
              <span className="text-lg">💬</span>
              Fale Conosco
            </Link>
            <Link to="/pedidos" className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-colors">
              <PackageIcon className="w-5 h-5" />
              Meus Pedidos
            </Link>
            <Link to="/carrinho" className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-lg transition-colors">
              <CartIcon className="w-5 h-5" />
              Carrinho
              {totalItems > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">{totalItems}</span>}
            </Link>
          </div>

          <div className="pt-4 border-t border-border">
            {isAuthenticated ? (
              <div className="space-y-1">
                {user.isAdmin && (
                  <Link to="/admin" className="block px-3 py-3 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors">
                    Painel Admin
                  </Link>
                )}
                <button onClick={() => { logout(); onClose() }} className="block w-full text-left px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/entrar" className="flex-1 px-3 py-3 text-sm font-medium text-center bg-accent text-black rounded-lg hover:opacity-90 transition-opacity">
                  Entrar
                </Link>
                <Link to="/cadastrar" className="flex-1 px-3 py-3 text-sm font-medium text-center border border-border text-text-secondary rounded-lg hover:border-text-muted hover:text-text-primary transition-colors">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
