import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { Badge } from '../ui/Badge'

const TABS = [
  { to: '/', label: 'Início', icon: HomeIcon },
  { to: '/ofertas', label: 'Ofertas', icon: FireIcon },
  { to: '/favoritos', label: 'Favoritos', icon: HeartIcon, requiresAuth: true },
  { to: '/carrinho', label: 'Carrinho', icon: CartIcon2 },
  { to: '/pedidos', label: 'Pedidos', icon: PackageIcon, requiresAuth: true },
]

function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function FireIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  )
}

function HeartIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}

function CartIcon2({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function PackageIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

export function MobileBottomNav() {
  const location = useLocation()
  const { totalItems } = useCart()
  const { isAuthenticated } = useAuth()
  const { wishlistSlugs } = useWishlist()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-md border-t border-accent/25 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          if (tab.requiresAuth && !isAuthenticated) return null
          const isActive = tab.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.to)
          const Icon = tab.icon
          let count = 0
          if (tab.label === 'Carrinho') count = totalItems
          if (tab.label === 'Favoritos') count = wishlistSlugs.length

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-accent'
                  : 'text-text-muted'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {count > 0 && <Badge count={count} className="!-top-1.5 !right-auto !-right-2" />}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : ''}`}>{tab.label}</span>
              {isActive && <span className="absolute -bottom-0.5 w-5 h-0.5 bg-accent rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
