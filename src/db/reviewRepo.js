import { transaction } from './db'

export async function addReview(review) {
  return transaction(['reviews'], 'readwrite', async (stores) => {
    return await stores.reviews.add({
      ...review,
      createdAt: new Date().toISOString(),
    })
  })
}

export async function getReviewsByModel(modelSlug) {
  return transaction(['reviews'], 'readonly', async (stores) => {
    const index = stores.reviews.index('modelSlug')
    return await index.getAll(modelSlug)
  })
}

export async function getReviewsByUser(username) {
  return transaction(['reviews'], 'readonly', async (stores) => {
    const index = stores.reviews.index('username')
    return await index.getAll(username)
  })
}
