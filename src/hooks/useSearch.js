import { useState, useEffect, useContext } from 'react'
import { DatabaseContext } from '../context/DatabaseContext'
import { getModels } from '../db/modelRepo'

export function useSearch(query) {
  const { ready } = useContext(DatabaseContext)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready || !query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    let mounted = true
    setLoading(true)

    const q = query.toLowerCase().trim()

    ;(async () => {
      try {
        const all = await getModels()
        if (!mounted) return
        const filtered = all.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.brand.toLowerCase().includes(q) ||
            (m.description && m.description.toLowerCase().includes(q))
        )
        if (mounted) setResults(filtered)
      } catch {}
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [ready, query])

  return { results, loading }
}
