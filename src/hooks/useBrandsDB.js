import { useState, useEffect, useContext } from 'react'
import { DatabaseContext } from '../context/DatabaseContext'
import { getBrands } from '../db/categoryRepo'
import { getBrandsWithModels } from '../db/modelRepo'

export function useBrandsDB(filters = {}) {
  const { ready } = useContext(DatabaseContext)
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    let mounted = true
    setLoading(true)

    ;(async () => {
      try {
        const [allBrands, activeBrands] = await Promise.all([
          getBrands(filters),
          filters.gender && filters.subcategory
            ? getBrandsWithModels(filters.gender, filters.subcategory)
            : Promise.resolve([]),
        ])
        if (mounted) {
          const filtered = activeBrands.length > 0
            ? allBrands.filter((b) => activeBrands.includes(b.name))
            : allBrands
          setBrands(filtered.map((b) => b.name))
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [ready, filters.gender, filters.subcategory])

  return { brands, loading }
}
