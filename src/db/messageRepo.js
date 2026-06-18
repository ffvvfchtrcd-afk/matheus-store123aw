import { transaction } from './db'

export async function sendMessage({ username, name, message, isAdmin }) {
  return transaction(['messages'], 'readwrite', async (stores) => {
    const msg = { username, name, message, isAdmin: !!isAdmin, isRead: false, createdAt: new Date().toISOString() }
    return await stores.messages.put(msg)
  })
}

export async function getMessagesByUser(username) {
  return transaction(['messages'], 'readonly', async (stores) => {
    const index = stores.messages.index('username')
    const all = await index.getAll(username)
    return all.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  })
}

export async function getAllConversations() {
  return transaction(['messages'], 'readonly', async (stores) => {
    const all = await stores.messages.getAll()
    const grouped = {}
    for (const msg of all) {
      if (!grouped[msg.username]) {
        grouped[msg.username] = { username: msg.username, name: msg.name, messages: [], unread: 0 }
      }
      grouped[msg.username].messages.push(msg)
      if (!msg.isAdmin && !msg.isRead) grouped[msg.username].unread++
    }
    const conversations = Object.values(grouped)
    for (const conv of conversations) {
      conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      conv.lastMessage = conv.messages[conv.messages.length - 1]
    }
    return conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
  })
}

export async function getConversation(username) {
  const msgs = await getMessagesByUser(username)
  return { username, messages: msgs }
}

export async function markAsRead(username) {
  return transaction(['messages'], 'readwrite', async (stores) => {
    const index = stores.messages.index('username')
    const all = await index.getAll(username)
    for (const msg of all) {
      if (!msg.isAdmin && !msg.isRead) {
        msg.isRead = true
        await stores.messages.put(msg)
      }
    }
  })
}

export async function getUnreadCount() {
  return transaction(['messages'], 'readonly', async (stores) => {
    const all = await stores.messages.getAll()
    return all.filter((m) => !m.isAdmin && !m.isRead).length
  })
}
