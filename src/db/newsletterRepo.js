import { transaction } from './db'

export async function subscribeEmail(email) {
  return transaction(['newsletter'], 'readwrite', async (stores) => {
    const existing = await stores.newsletter.get(email)
    if (existing) return false
    await stores.newsletter.put({ email, subscribedAt: new Date().toISOString() })
    return true
  })
}

export async function getSubscribers() {
  return transaction(['newsletter'], 'readonly', async (stores) => {
    return await stores.newsletter.getAll()
  })
}
