import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getUserByUsername, createUser, createAdminIfNotExists } from '../db/userRepo'
import { DatabaseContext } from './DatabaseContext'

const AuthContext = createContext()

function useAuthProvider() {
  const { ready } = useContext(DatabaseContext)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    ;(async () => {
      try {
        await createAdminIfNotExists()
        const stored = sessionStorage.getItem('@lojavault-user')
        if (stored) {
          const parsed = JSON.parse(stored)
          const dbUser = await getUserByUsername(parsed.username)
          if (dbUser && dbUser.password === parsed.password) {
            if (mounted) setUser({ username: dbUser.username, name: dbUser.name, isAdmin: dbUser.isAdmin })
          } else {
            sessionStorage.removeItem('@lojavault-user')
          }
        }
      } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [ready])

  const login = useCallback(async (username, password) => {
    const dbUser = await getUserByUsername(username)
    if (!dbUser || dbUser.password !== btoa(password)) {
      throw new Error('Usuário ou senha inválidos')
    }
    sessionStorage.setItem('@lojavault-user', JSON.stringify({ username: dbUser.username, password: dbUser.password }))
    setUser({ username: dbUser.username, name: dbUser.name, isAdmin: dbUser.isAdmin })
  }, [])

  const signup = useCallback(async (name, username, password) => {
    const created = await createUser({ username, name, password: btoa(password) })
    sessionStorage.setItem('@lojavault-user', JSON.stringify({ username: created.username, password: btoa(password) }))
    setUser({ username: created.username, name: created.name, isAdmin: false })
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('@lojavault-user')
    setUser(null)
  }, [])

  return { user, loading, login, signup, logout, isAuthenticated: !!user }
}

export function AuthProvider({ children }) {
  const value = useAuthProvider()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
