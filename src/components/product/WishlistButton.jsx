import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartIcon } from '../ui/Icons'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'

export function WishlistButton({ modelSlug, className = '', variant = 'icon' }) {
  const { isAuthenticated } = useAuth()
  const { wishlistSlugs, toggle } = useWishlist()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const isFavorited = wishlistSlugs.includes(modelSlug)

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate(`/entrar?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    const added = await toggle(modelSlug)
    addToast(added ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', added ? 'success' : 'info')
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${className} ${
          isFavorited ? 'text-red-500 bg-red-500/10' : 'text-text-muted hover:text-red-400 bg-surface/60'
        }`}
        aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <HeartIcon className={`w-5 h-5 transition-all ${isFavorited ? 'fill-current' : ''}`} />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
        isFavorited
          ? 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10'
          : 'border-border text-text-secondary hover:text-red-400 hover:border-red-500/30'
      } ${className}`}
    >
      <HeartIcon className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
      {isFavorited ? 'Favoritado' : 'Favoritar'}
    </button>
  )
}
