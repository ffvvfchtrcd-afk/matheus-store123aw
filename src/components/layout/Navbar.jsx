import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { Badge } from '../ui/Badge'
import { CartIcon, MenuIcon, Logotype, UserIcon, HeartIcon } from '../ui/Icons'
import { MobileMenu } from './MobileMenu'
import { SearchBar } from '../search/SearchBar'
import categories from '../../data/categories.json'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const { wishlistSlugs } = useWishlist()
  const location = useLocation()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-accent/35 shadow-[0_2px_20px_rgba(232,184,74,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Logotype className="h-6" />
            </Link>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/ofertas" className={`text-sm font-medium transition-colors duration-150 ${location.pathname === '/ofertas' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
                Ofertas
              </Link>
              {categories.map((cat) => (
                <div key={cat.slug} className="relative group">
                  <Link
                    to={`/${cat.slug}`}
                    className={`text-sm font-medium transition-colors duration-150 ${
                      location.pathname.startsWith(`/${cat.slug}`)
                        ? 'text-text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {cat.label}
                  </Link>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 scale-y-0 group-hover:scale-y-100 origin-top">
                    <div className="bg-surface-secondary border border-border rounded-xl p-3 shadow-lg min-w-[200px]">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          to={`/${cat.slug}/${sub.slug}`}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                            location.pathname === `/${cat.slug}/${sub.slug}`
                              ? 'bg-surface-hover text-text-primary'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.name || user.username}</span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-surface-secondary border border-border rounded-xl shadow-lg p-2 z-20">
                        <Link to="/pedidos" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
                          Meus Pedidos
                        </Link>
                        <Link to="/favoritos" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
                          Favoritos
                        </Link>
                        <Link to="/fale-conosco" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors">
                          Fale Conosco
                        </Link>
                        {user.isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-accent hover:bg-accent/5 rounded-lg transition-colors">
                            Painel Admin
                          </Link>
                        )}
                        <hr className="my-1 border-border" />
                        <button onClick={() => { logout(); setUserMenuOpen(false) }} className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          Sair
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/entrar" className="hidden sm:block px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors">
                  Entrar
                </Link>
              )}

              <Link to="/favoritos" className="hidden md:block relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                <HeartIcon className="w-5 h-5" />
                {wishlistSlugs.length > 0 && <Badge count={wishlistSlugs.length} />}
              </Link>

              <Link to="/carrinho" className="hidden md:block relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                <CartIcon className="w-6 h-6" />
                {totalItems > 0 && <Badge count={totalItems} />}
              </Link>

              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors">
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
