import { transaction } from './db'

function generateTicketNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TCK-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createTicket({ username, name, subject, category, orderNumber, description }) {
  return transaction(['tickets', 'messages'], 'readwrite', async (stores) => {
    const ticket = {
      ticketNumber: generateTicketNumber(),
      username,
      name: name || username,
      subject,
      category,
      orderNumber: orderNumber || null,
      description,
      status: 'open',
      priority: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const ticketId = await stores.tickets.add(ticket)

    await stores.messages.add({
      ticketId,
      username,
      name: name || username,
      message: description,
      isAdmin: false,
      isRead: false,
      createdAt: new Date().toISOString(),
    })

    return { ...ticket, id: ticketId }
  })
}

export async function getTickets(filters = {}) {
  return transaction(['tickets'], 'readonly', async (stores) => {
    let results
    if (filters.status) {
      const index = stores.tickets.index('status')
      results = await index.getAll(filters.status)
    } else if (filters.category) {
      const index = stores.tickets.index('category')
      results = await index.getAll(filters.category)
    } else {
      results = await stores.tickets.getAll()
    }

    if (filters.status && filters.category) {
      results = results.filter((t) => t.category === filters.category)
    }
    if (filters.username) {
      results = results.filter((t) => t.username === filters.username)
    }

    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })
}

export async function getTicketsByUser(username) {
  return transaction(['tickets'], 'readonly', async (stores) => {
    const index = stores.tickets.index('username')
    const results = await index.getAll(username)
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })
}

export async function getTicketById(id) {
  return transaction(['tickets'], 'readonly', async (stores) => {
    return await stores.tickets.get(id)
  })
}

export async function getTicketByNumber(ticketNumber) {
  return transaction(['tickets'], 'readonly', async (stores) => {
    const index = stores.tickets.index('ticketNumber')
    return await index.get(ticketNumber)
  })
}

export async function updateTicketStatus(id, status) {
  return transaction(['tickets'], 'readwrite', async (stores) => {
    const ticket = await stores.tickets.get(id)
    if (!ticket) throw new Error('Ticket não encontrado')
    ticket.status = status
    ticket.updatedAt = new Date().toISOString()
    await stores.tickets.put(ticket)
    return ticket
  })
}

export async function updateTicketPriority(id, priority) {
  return transaction(['tickets'], 'readwrite', async (stores) => {
    const ticket = await stores.tickets.get(id)
    if (!ticket) throw new Error('Ticket não encontrado')
    ticket.priority = priority
    ticket.updatedAt = new Date().toISOString()
    await stores.tickets.put(ticket)
    return ticket
  })
}

export async function addTicketReply({ ticketId, username, name, message, isAdmin }) {
  return transaction(['tickets', 'messages'], 'readwrite', async (stores) => {
    const msg = {
      ticketId,
      username,
      name: name || username,
      message,
      isAdmin: !!isAdmin,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    await stores.messages.add(msg)

    const ticket = await stores.tickets.get(ticketId)
    if (ticket) {
      ticket.updatedAt = new Date().toISOString()
      if (isAdmin) {
        if (ticket.status === 'open') ticket.status = 'answered'
      } else {
        ticket.status = 'open'
      }
      await stores.tickets.put(ticket)
    }

    return msg
  })
}

export async function getTicketMessages(ticketId) {
  return transaction(['messages'], 'readonly', async (stores) => {
    const index = stores.messages.index('ticketId')
    const all = await index.getAll(ticketId)
    return all.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  })
}

export async function getUnreadTicketCount() {
  return transaction(['tickets'], 'readonly', async (stores) => {
    const index = stores.tickets.index('status')
    const open = await index.getAll('open')
    const answered = await index.getAll('answered')
    return open.length + answered.length
  })
}
