import { transaction } from './db'

export async function getAllCategories() {
  return transaction(['categories'], 'readonly', async (stores) => {
    return await stores.categories.getAll()
  })
}

export async function getCategoryBySlug(slug) {
  return transaction(['categories'], 'readonly', async (stores) => {
    return await stores.categories.get(slug)
  })
}

export async function saveCategory(category) {
  return transaction(['categories'], 'readwrite', async (stores) => {
    await stores.categories.put(category)
  })
}

export async function deleteCategory(slug) {
  return transaction(['categories'], 'readwrite', async (stores) => {
    await stores.categories.delete(slug)
  })
}

export async function getBrandBySlug(slug) {
  return transaction(['brands'], 'readonly', async (stores) => {
    return await stores.brands.get(slug)
  })
}

export async function getBrands(filters = {}) {
  return transaction(['brands'], 'readonly', async (stores) => {
    let results

    if (filters.gender && filters.subcategory) {
      const index = stores.brands.index('gender_subcategory')
      results = await index.getAll([filters.gender, filters.subcategory])
    } else if (filters.gender) {
      const index = stores.brands.index('gender')
      results = await index.getAll(filters.gender)
    } else {
      results = await stores.brands.getAll()
    }

    if (filters.subcategory && !filters.gender) {
      results = results.filter((b) => b.subcategory === filters.subcategory)
    }

    return results.sort((a, b) => a.name.localeCompare(b.name))
  })
}

export async function saveBrand(brand) {
  return transaction(['brands'], 'readwrite', async (stores) => {
    await stores.brands.put(brand)
  })
}

export async function deleteBrand(name) {
  return transaction(['brands'], 'readwrite', async (stores) => {
    await stores.brands.delete(name)
  })
}
