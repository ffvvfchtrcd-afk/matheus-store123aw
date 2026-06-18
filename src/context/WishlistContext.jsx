import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { DatabaseContext } from './DatabaseContext'
import { addToWishlist, removeFromWishlist, getWishlistModelSlugs, isInWishlist } from '../db/wishlistRepo'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const { ready } = useContext(DatabaseContext)
  const [wishlistSlugs, setWishlistSlugs] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!ready || !isAuthenticated || !user) {
      setWishlistSlugs([])
      return
    }
    setLoading(true)
    try {
      const slugs = await getWishlistModelSlugs(user.username)
      setWishlistSlugs(slugs)
    } catch {}
    setLoading(false)
  }, [ready, isAuthenticated, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback(async (modelSlug) => {
    if (!isAuthenticated || !user) return false
    await addToWishlist(user.username, modelSlug)
    setWishlistSlugs((prev) => [...prev, modelSlug])
    return true
  }, [isAuthenticated, user])

  const remove = useCallback(async (modelSlug) => {
    if (!isAuthenticated || !user) return
    await removeFromWishlist(user.username, modelSlug)
    setWishlistSlugs((prev) => prev.filter((s) => s !== modelSlug))
  }, [isAuthenticated, user])

  const check = useCallback(async (modelSlug) => {
    if (!isAuthenticated || !user) return false
    return wishlistSlugs.includes(modelSlug)
  }, [isAuthenticated, user, wishlistSlugs])

  const toggle = useCallback(async (modelSlug) => {
    if (wishlistSlugs.includes(modelSlug)) {
      await remove(modelSlug)
      return false
    } else {
      await add(modelSlug)
      return true
    }
  }, [wishlistSlugs, add, remove])

  return (
    <WishlistContext.Provider value={{ wishlistSlugs, loading, add, remove, check, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
