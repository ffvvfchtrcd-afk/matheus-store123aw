import { useState, useEffect, useContext, useMemo } from 'react'
import { DatabaseContext } from '../context/DatabaseContext'
import { getModels, getModelBySlug, getFeaturedModels, getRelatedModels } from '../db/modelRepo'

function sortModels(models, sort) {
  if (!sort || sort === 'relevance') return models
  const sorted = [...models]
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => {
        const aMin = Math.min(...(a.variants || []).map((v) => v.price))
        const bMin = Math.min(...(b.variants || []).map((v) => v.price))
        return aMin - bMin
      })
      break
    case 'price-desc':
      sorted.sort((a, b) => {
        const aMin = Math.min(...(a.variants || []).map((v) => v.price))
        const bMin = Math.min(...(b.variants || []).map((v) => v.price))
        return bMin - aMin
      })
      break
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      break
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'))
      break
  }
  return sorted
}

function filterModels(models, { minPrice, maxPrice, color, size }) {
  let filtered = models
  if (minPrice !== undefined && minPrice !== '') {
    const min = Number(minPrice)
    filtered = filtered.filter((m) => (m.variants || []).some((v) => v.price >= min))
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    const max = Number(maxPrice)
    filtered = filtered.filter((m) => (m.variants || []).some((v) => v.price <= max))
  }
  if (color) {
    filtered = filtered.filter((m) => (m.colors || []).some((c) => c.toLowerCase() === color.toLowerCase()))
  }
  if (size) {
    const sizeLower = size.toLowerCase()
    filtered = filtered.filter((m) => (m.variants || []).some((v) => v.size.toLowerCase() === sizeLower))
  }
  return filtered
}

export function useModelsDB(filters = {}) {
  const { ready } = useContext(DatabaseContext)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  const { sort, minPrice, maxPrice, color, size, ...queryFilters } = filters

  useEffect(() => {
    if (!ready) {
      setLoading(true)
      return
    }
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        let result = await getModels(queryFilters)
        result = sortModels(result, sort)
        result = filterModels(result, { minPrice, maxPrice, color, size })
        if (mounted) setModels(result)
      } catch {}
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [ready, filters.gender, filters.subcategory, filters.brand, filters.featured, filters.sort, filters.minPrice, filters.maxPrice, filters.color, filters.size])

  return { models, loading }
}

export function useModelFilters(models) {
  return useMemo(() => {
    const colors = [...new Set((models || []).flatMap((m) => m.colors || []))]
    const sizes = [...new Set((models || []).flatMap((m) => (m.variants || []).map((v) => v.size)))]
    const minPrice = Math.min(...(models || []).flatMap((m) => (m.variants || []).map((v) => v.price)))
    const maxPrice = Math.max(...(models || []).flatMap((m) => (m.variants || []).map((v) => v.price)))
    return { colors, sizes, minPrice, maxPrice }
  }, [models])
}

export function useModelDB(slug) {
  const { ready } = useContext(DatabaseContext)
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getModelBySlug(slug)
        if (mounted) setModel(result)
      } catch {}
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [ready, slug])

  return { model, loading }
}

export function useFeaturedModelsDB() {
  const { ready } = useContext(DatabaseContext)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getFeaturedModels()
        if (mounted) setModels(result)
      } catch {}
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [ready])

  return { models, loading }
}

export function useRelatedModelsDB(model) {
  const { ready } = useContext(DatabaseContext)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready || !model) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getRelatedModels(model)
        if (mounted) setModels(result)
      } catch {}
      if (mounted) setLoading(false)
    })()

    return () => { mounted = false }
  }, [ready, model?.slug])

  return { models, loading }
}
