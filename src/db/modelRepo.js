import { transaction } from './db'

// Brand slug map — slugs must match BrandGrid's toLowerCase + replace(/[^a-z0-9]/g, '-')
const BRAND_SLUG_MAP = {
  'nike': 'Nike',
  'adidas': 'Adidas',
  'hering': 'Hering',
  'puma': 'Puma',
  'levi-s': "Levi's",
  'tommy-hilfiger': 'Tommy Hilfiger',
  'calvin-klein': 'Calvin Klein',
  'casio': 'Casio',
  'farm': 'Farm',
  'zara': 'Zara',
  'animale': 'Animale',
  'h-m': 'H&M',
  'renner': 'Renner',
  'arezzo': 'Arezzo',
  'schutz': 'Schutz',
  'riachuelo': 'Riachuelo',
  'vivara': 'Vivara',
}

function resolveBrand(slug) {
  if (!slug) return null
  return BRAND_SLUG_MAP[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function getModels(filters = {}) {
  return transaction(['models'], 'readonly', async (stores) => {
    let results
    const brandName = filters.brand ? resolveBrand(filters.brand) : null

    if (filters.gender && filters.subcategory && brandName) {
      const index = stores.models.index('gender_subcategory_brand')
      results = await index.getAll([filters.gender, filters.subcategory, brandName])
    } else if (filters.gender && filters.subcategory) {
      const index = stores.models.index('gender_subcategory')
      results = await index.getAll([filters.gender, filters.subcategory])
    } else if (filters.gender) {
      const index = stores.models.index('gender')
      results = await index.getAll(filters.gender)
    } else if (brandName) {
      const index = stores.models.index('brand')
      results = await index.getAll(brandName)
    } else {
      results = await stores.models.getAll()
    }

    if (filters.featured) {
      results = results.filter((m) => m.featured)
    }

    return results
  })
}

export async function getModelBySlug(slug) {
  return transaction(['models'], 'readonly', async (stores) => {
    return await stores.models.get(slug)
  })
}

export async function getFeaturedModels() {
  const all = await getModels({})
  return all.filter((m) => m.featured === true)
}

export async function getBrandsWithModels(gender, subcategory) {
  return transaction(['models'], 'readonly', async (stores) => {
    const index = stores.models.index('gender_subcategory')
    const results = await index.getAll([gender, subcategory])
    const brands = [...new Set(results.map((m) => m.brand))]
    return brands
  })
}

export async function getRelatedModels(model, limit = 4) {
  if (!model) return []
  return transaction(['models'], 'readonly', async (stores) => {
    const index = stores.models.index('gender_subcategory')
    const all = await index.getAll([model.gender, model.subcategory])
    return all.filter((m) => m.slug !== model.slug).slice(0, limit)
  })
}

export async function saveModel(model) {
  return transaction(['models'], 'readwrite', async (stores) => {
    await stores.models.put(model)
  })
}

export async function deleteModel(slug) {
  return transaction(['models'], 'readwrite', async (stores) => {
    await stores.models.delete(slug)
  })
}
