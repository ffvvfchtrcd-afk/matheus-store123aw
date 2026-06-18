import categoriesData from '../data/categories.json'
import brandsData from '../data/brands.json'
import modelsData from '../data/models.json'
import { transaction } from './db'

let seeding = false

export async function seedDatabase() {
  if (seeding) return false
  seeding = true

  try {
    const needsSeed = await transaction(['models'], 'readonly', async (stores) => {
      const count = await stores.models.count()
      return count === 0
    })

    if (!needsSeed) return false

    await transaction(['categories', 'brands', 'models'], 'readwrite', async (stores) => {
      for (const cat of categoriesData) {
        await stores.categories.put(cat)
      }

      for (const brand of brandsData) {
        await stores.brands.put(brand)
      }

      for (const model of modelsData) {
        await stores.models.put(model)
      }
    })

    return true
  } finally {
    seeding = false
  }
}

export async function resetSeed() {
  await transaction(['categories', 'brands', 'models'], 'readwrite', async (stores) => {
    await stores.categories.clear()
    await stores.brands.clear()
    await stores.models.clear()
  })
}
