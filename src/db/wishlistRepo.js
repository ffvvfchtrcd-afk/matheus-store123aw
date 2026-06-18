import { transaction } from './db'

export async function addToWishlist(username, modelSlug) {
  return transaction(['wishlist'], 'readwrite', async (stores) => {
    const index = stores.wishlist.index('username_modelSlug')
    const existing = await index.get([username, modelSlug])
    if (existing) return false
    await stores.wishlist.add({ username, modelSlug, createdAt: new Date().toISOString() })
    return true
  })
}

export async function removeFromWishlist(username, modelSlug) {
  return transaction(['wishlist'], 'readwrite', async (stores) => {
    const index = stores.wishlist.index('username_modelSlug')
    const entry = await index.get([username, modelSlug])
    if (entry) {
      await stores.wishlist.delete(entry.id)
    }
  })
}

export async function getWishlist(username) {
  return transaction(['wishlist'], 'readonly', async (stores) => {
    const index = stores.wishlist.index('username')
    return await index.getAll(username)
  })
}

export async function isInWishlist(username, modelSlug) {
  return transaction(['wishlist'], 'readonly', async (stores) => {
    const index = stores.wishlist.index('username_modelSlug')
    const entry = await index.get([username, modelSlug])
    return !!entry
  })
}

export async function getWishlistModelSlugs(username) {
  const entries = await getWishlist(username)
  return entries.map((e) => e.modelSlug)
}
