import { transaction } from './db'

export async function createUser({ username, name, password }) {
  return transaction(['users'], 'readwrite', async (stores) => {
    const existing = await stores.users.get(username)
    if (existing) throw new Error('Usuário já cadastrado')
    const user = { username, name, password, createdAt: new Date().toISOString(), isAdmin: false }
    await stores.users.put(user)
    return { username, name, isAdmin: false }
  })
}

export async function getUserByUsername(username) {
  return transaction(['users'], 'readonly', async (stores) => {
    return await stores.users.get(username)
  })
}

export async function getAllUsers() {
  return transaction(['users'], 'readonly', async (stores) => {
    return await stores.users.getAll()
  })
}

export async function createAdminIfNotExists() {
  return transaction(['users'], 'readwrite', async (stores) => {
    const admin = await stores.users.get('ADMIN')
    if (admin) return false
    await stores.users.put({
      username: 'ADMIN',
      name: 'Administrador',
      password: btoa('ADMIN123'),
      createdAt: new Date().toISOString(),
      isAdmin: true,
    })
    return true
  })
}
