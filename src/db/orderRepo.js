import { transaction } from './db'

export async function saveOrder(order) {
  return transaction(['orders'], 'readwrite', async (stores) => {
    await stores.orders.put(order)
  })
}

export async function getOrders() {
  return transaction(['orders'], 'readonly', async (stores) => {
    const index = stores.orders.index('createdAt')
    const all = await index.getAll()
    return all.reverse()
  })
}

export async function getOrderByNumber(number) {
  return transaction(['orders'], 'readonly', async (stores) => {
    return await stores.orders.get(number)
  })
}

export async function getOrdersByUser(username) {
  return transaction(['orders'], 'readonly', async (stores) => {
    const index = stores.orders.index('username')
    const all = await index.getAll(username)
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })
}

export async function updateOrderStatus(orderNumber, status) {
  return transaction(['orders'], 'readwrite', async (stores) => {
    const order = await stores.orders.get(orderNumber)
    if (!order) throw new Error('Pedido não encontrado')
    order.status = status
    order.statusUpdatedAt = new Date().toISOString()
    await stores.orders.put(order)
    return order
  })
}
