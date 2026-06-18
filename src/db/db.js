const DB_NAME = 'LOJAVaultDB'
const DB_VERSION = 7

let dbInstance = null

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      const tx = event.target.transaction

      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'slug' })
      }

      if (!db.objectStoreNames.contains('brands')) {
        const brandStore = db.createObjectStore('brands', { keyPath: 'name' })
        brandStore.createIndex('gender', 'gender', { unique: false })
        brandStore.createIndex('subcategory', 'subcategory', { unique: false })
        brandStore.createIndex('gender_subcategory', ['gender', 'subcategory'], { unique: false })
      }

      if (!db.objectStoreNames.contains('models')) {
        const modelStore = db.createObjectStore('models', { keyPath: 'slug' })
        modelStore.createIndex('brand', 'brand', { unique: false })
        modelStore.createIndex('gender', 'gender', { unique: false })
        modelStore.createIndex('subcategory', 'subcategory', { unique: false })
        modelStore.createIndex('featured', 'featured', { unique: false })
        modelStore.createIndex('gender_subcategory', ['gender', 'subcategory'], { unique: false })
        modelStore.createIndex('gender_subcategory_brand', ['gender', 'subcategory', 'brand'], { unique: false })
      }

      if (!db.objectStoreNames.contains('orders')) {
        const orderStore = db.createObjectStore('orders', { keyPath: 'orderNumber' })
        orderStore.createIndex('createdAt', 'createdAt', { unique: false })
        orderStore.createIndex('username', 'username', { unique: false })
      } else {
        const orderStore = tx.objectStore('orders')
        if (orderStore.indexNames.contains('userEmail')) {
          orderStore.deleteIndex('userEmail')
        }
        if (!orderStore.indexNames.contains('username')) {
          orderStore.createIndex('username', 'username', { unique: false })
        }
      }

      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' })
      }

      if (!db.objectStoreNames.contains('messages')) {
        const msgStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true })
        msgStore.createIndex('username', 'username', { unique: false })
        msgStore.createIndex('ticketId', 'ticketId', { unique: false })
        msgStore.createIndex('createdAt', 'createdAt', { unique: false })
      } else {
        const msgStore = tx.objectStore('messages')
        if (msgStore.indexNames.contains('userEmail')) {
          msgStore.deleteIndex('userEmail')
        }
        if (!msgStore.indexNames.contains('username')) {
          msgStore.createIndex('username', 'username', { unique: false })
        }
        if (!msgStore.indexNames.contains('ticketId')) {
          msgStore.createIndex('ticketId', 'ticketId', { unique: false })
        }
      }

      if (!db.objectStoreNames.contains('reviews')) {
        const reviewStore = db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true })
        reviewStore.createIndex('modelSlug', 'modelSlug', { unique: false })
        reviewStore.createIndex('username', 'username', { unique: false })
        reviewStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains('newsletter')) {
        db.createObjectStore('newsletter', { keyPath: 'email' })
      }

      if (!db.objectStoreNames.contains('wishlist')) {
        const wlStore = db.createObjectStore('wishlist', { keyPath: 'id', autoIncrement: true })
        wlStore.createIndex('username', 'username', { unique: false })
        wlStore.createIndex('modelSlug', 'modelSlug', { unique: false })
        wlStore.createIndex('username_modelSlug', ['username', 'modelSlug'], { unique: true })
      }

      if (!db.objectStoreNames.contains('tickets')) {
        const ticketStore = db.createObjectStore('tickets', { keyPath: 'id', autoIncrement: true })
        ticketStore.createIndex('ticketNumber', 'ticketNumber', { unique: true })
        ticketStore.createIndex('username', 'username', { unique: false })
        ticketStore.createIndex('status', 'status', { unique: false })
        ticketStore.createIndex('category', 'category', { unique: false })
        ticketStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = event.target.result
      resolve(dbInstance)
    }

    request.onerror = (event) => {
      reject(new Error(`Erro ao abrir banco: ${event.target.error}`))
    }
  })
}

export async function getDB() {
  if (dbInstance) return dbInstance
  return await openDB()
}

function promisify(method, ...args) {
  const store = this
  return new Promise((resolve, reject) => {
    const request = store[method](...args)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const METHODS = ['get', 'getAll', 'add', 'put', 'delete', 'count', 'getKey', 'getAllKeys']

function wrapStore(store) {
  const wrapped = {}
  for (const key of METHODS) {
    if (typeof store[key] === 'function') {
      wrapped[key] = promisify.bind(store, key)
    }
  }
  wrapped.index = (name) => wrapIndex(store.index(name))
  return wrapped
}

function wrapIndex(index) {
  const wrapped = {}
  for (const key of METHODS) {
    if (typeof index[key] === 'function') {
      wrapped[key] = promisify.bind(index, key)
    }
  }
  return wrapped
}

export async function transaction(storeNames, mode = 'readonly', callback) {
  const db = await getDB()
  const tx = db.transaction(storeNames, mode)
  const stores = {}
  for (const name of storeNames) {
    stores[name] = wrapStore(tx.objectStore(name))
  }

  let result
  try {
    result = await callback(stores)
  } catch (err) {
    tx.abort()
    throw err
  }

  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = (e) => reject(e.target.error || 'Falha na transação')
  })

  return result
}
