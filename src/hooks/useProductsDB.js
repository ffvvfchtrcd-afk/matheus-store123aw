import { useState, useEffect, useContext } from 'react'
import { DatabaseContext } from '../context/DatabaseContext'
import { getProducts, getProductBySlug, getFeaturedProducts, getRelatedProducts } from '../db/productRepo'

export function useProductsDB(filters = {}) {
  const { ready } = useContext(DatabaseContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getProducts(filters)
        if (mounted) {
          setProducts(result)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    })()

    return () => { mounted = false }
  }, [ready, filters.gender, filters.subcategory, filters.brand, filters.featured])

  return { products, loading, error }
}

export function useProductDB(slug) {
  const { ready } = useContext(DatabaseContext)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getProductBySlug(slug)
        if (mounted) {
          setProduct(result)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    })()

    return () => { mounted = false }
  }, [ready, slug])

  return { product, loading, error }
}

export function useFeaturedProductsDB() {
  const { ready } = useContext(DatabaseContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getFeaturedProducts()
        if (mounted) {
          setProducts(result)
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [ready])

  return { products, loading }
}

export function useRelatedProductsDB(product) {
  const { ready } = useContext(DatabaseContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready || !product) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const result = await getRelatedProducts(product)
        if (mounted) {
          setProducts(result)
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [ready, product?.id])

  return { products, loading }
}
