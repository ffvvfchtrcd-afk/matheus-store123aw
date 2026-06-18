import { useMemo } from 'react'
import products from '../data/products.json'

export function useProducts({ gender, subcategory, brand, featured } = {}) {
  return useMemo(() => {
    let filtered = [...products]

    if (gender) {
      filtered = filtered.filter((p) => p.gender === gender)
    }
    if (subcategory) {
      filtered = filtered.filter((p) => p.subcategory === subcategory)
    }
    if (brand) {
      filtered = filtered.filter((p) => {
        const brandSlug = p.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')
        return brandSlug === brand
      })
    }
    if (featured) {
      filtered = filtered.filter((p) => p.featured)
    }

    return filtered
  }, [gender, subcategory, brand, featured])
}

export function useProduct(slug) {
  return useMemo(() => {
    return products.find((p) => p.slug === slug) || null
  }, [slug])
}

export function useRelatedProducts(product, limit = 4) {
  return useMemo(() => {
    if (!product) return []
    return products
      .filter((p) => p.gender === product.gender && p.id !== product.id)
      .slice(0, limit)
  }, [product, limit])
}

export function useBrands(gender, subcategory) {
  return useMemo(() => {
    let filtered = [...products]
    if (gender) filtered = filtered.filter((p) => p.gender === gender)
    if (subcategory) filtered = filtered.filter((p) => p.subcategory === subcategory)
    const brands = [...new Set(filtered.map((p) => p.brand))].filter(Boolean)
    return brands.sort()
  }, [gender, subcategory])
}
