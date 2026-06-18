import { useState, useEffect, useContext } from 'react'
import { DatabaseContext } from '../context/DatabaseContext'
import { getAllCategories, getCategoryBySlug } from '../db/categoryRepo'

export function useCategoriesDB() {
  const { ready } = useContext(DatabaseContext)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getAllCategories()
        if (mounted) {
          setCategories(result)
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [ready])

  return { categories, loading }
}

export function useCategoryDB(slug) {
  const { ready } = useContext(DatabaseContext)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getCategoryBySlug(slug)
        if (mounted) {
          setCategory(result)
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [ready, slug])

  return { category, loading }
}
