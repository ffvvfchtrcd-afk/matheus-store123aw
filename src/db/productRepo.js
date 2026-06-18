import { transaction } from './db'

export async function getAllProducts() {
  return transaction(['products'], 'readonly', async (stores) => {
    return await stores.products.getAll()
  })
}

export async function getProductById(id) {
  return transaction(['products'], 'readonly', async (stores) => {
    return await stores.products.get(id)
  })
}

export async function getProductBySlug(slug) {
  return transaction(['products'], 'readonly', async (stores) => {
    const index = stores.products.index('slug')
    return await index.get(slug)
  })
}

export async function getProducts(filters = {}) {
  return transaction(['products'], 'readonly', async (stores) => {
    let results

    if (filters.gender && filters.subcategory) {
      const index = stores.products.index('gender_subcategory')
      results = await index.getAll([filters.gender, filters.subcategory])
    } else if (filters.gender) {
      const index = stores.products.index('gender')
      results = await index.getAll(filters.gender)
    } else {
      results = await stores.products.getAll()
    }

    if (filters.brand) {
      const brandSlug = filters.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')
      results = results.filter((p) => {
        const slug = p.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')
        return slug === brandSlug
      })
    }

    if (filters.subcategory && !filters.gender) {
      results = results.filter((p) => p.subcategory === filters.subcategory)
    }

    if (filters.featured) {
      results = results.filter((p) => p.featured)
    }

    if (filters.ids) {
      results = results.filter((p) => filters.ids.includes(p.id))
    }

    return results
  })
}

export async function getFeaturedProducts() {
  return transaction(['products'], 'readonly', async (stores) => {
    const index = stores.products.index('featured')
    return await index.getAll(true)
  })
}

export async function getRelatedProducts(product, limit = 4) {
  if (!product) return []
  return transaction(['products'], 'readonly', async (stores) => {
    const index = stores.products.index('gender')
    const all = await index.getAll(product.gender)
    return all.filter((p) => p.id !== product.id).slice(0, limit)
  })
}

export async function addProduct(product) {
  return transaction(['products'], 'readwrite', async (stores) => {
    await stores.products.add(product)
  })
}

export async function updateProduct(product) {
  return transaction(['products'], 'readwrite', async (stores) => {
    await stores.products.put(product)
  })
}

export async function deleteProduct(id) {
  return transaction(['products'], 'readwrite', async (stores) => {
    await stores.products.delete(id)
  })
}
