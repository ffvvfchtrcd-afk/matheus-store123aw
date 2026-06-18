import { createContext, useState, useEffect, useRef } from 'react'
import { seedDatabase } from '../db/seed'

export const DatabaseContext = createContext()

export function DatabaseProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    let retries = 0

    const init = async () => {
      while (retries < 3 && mounted.current) {
        try {
          await seedDatabase()
          if (mounted.current) {
            setReady(true)
            setError(null)
          }
          return
        } catch (err) {
          retries++
          console.warn(`Tentativa ${retries}/3 - Erro ao inicializar banco:`, err.message)
          if (retries >= 3 && mounted.current) {
            setError(err.message)
            setReady(true)
          }
        }
      }
    }

    init()

    return () => { mounted.current = false }
  }, [])

  return (
    <DatabaseContext.Provider value={{ ready, error }}>
      {children}
    </DatabaseContext.Provider>
  )
}
