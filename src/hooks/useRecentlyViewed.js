import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = '@lojavault-recently-viewed'
const MAX_ITEMS = 8

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useRecentlyViewed() {
  const [slugs, setSlugs] = useState(load)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  }, [slugs])

  const addSlug = useCallback((slug) => {
    setSlugs((prev) => {
      const filtered = prev.filter((s) => s !== slug)
      return [slug, ...filtered].slice(0, MAX_ITEMS)
    })
  }, [])

  return { recentlyViewedSlugs: slugs, addSlug }
}
