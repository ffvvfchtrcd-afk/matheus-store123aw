import { createContext, useReducer, useEffect } from 'react'

export const CartContext = createContext()

const STORAGE_KEY = '@lojavault-cart'

function loadCart() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { items: [] }
  } catch {
    return { items: [] }
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { model, variant, quantity } = action.payload
      const variantId = `${model.slug}-${variant.size}-${variant.color}`
      const existingIndex = state.items.findIndex((item) => item.variantId === variantId)
      if (existingIndex >= 0) {
        const newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: Math.min(newItems[existingIndex].quantity + quantity, 99),
        }
        return { items: newItems }
      }
      return {
        items: [
          ...state.items,
          {
            variantId,
            modelSlug: model.slug,
            name: model.name,
            brand: model.brand,
            image: model.colorImages?.[variant.color] || model.images?.[0] || model.colors?.[0] || '#3b82f6',
            size: variant.size,
            color: variant.color,
            price: variant.price,
            originalPrice: variant.originalPrice,
            quantity,
          },
        ],
      }
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((item) => item.variantId !== action.payload.variantId),
      }
    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload
      return {
        items: state.items.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) }
            : item
        ),
      }
    }
    case 'CLEAR_CART':
      return { items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => loadCart())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = totalPrice >= 199 ? 0 : 14.90
  const total = totalPrice + shipping

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice, total, shipping }}>
      {children}
    </CartContext.Provider>
  )
}
