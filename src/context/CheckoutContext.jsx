import { createContext, useContext, useReducer } from 'react'
import { useCart } from '../hooks/useCart'

const CheckoutContext = createContext()

const STEPS = ['endereco', 'frete', 'pagamento', 'revisao']

const initialState = {
  step: 0,
  address: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
  shippingMethod: null,
  shippingOptions: [],
  paymentMethod: '',
  cardInfo: { number: '', name: '', expiry: '', cvv: '' },
  cpf: '',
  orderPlaced: false,
  orderNumber: '',
}

function checkoutReducer(state, action) {
  switch (action.type) {
    case 'SET_ADDRESS':
      return { ...state, address: { ...state.address, ...action.payload } }
    case 'SET_SHIPPING_OPTIONS':
      return { ...state, shippingOptions: action.payload }
    case 'SET_SHIPPING_METHOD':
      return { ...state, shippingMethod: action.payload }
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload }
    case 'SET_CARD_INFO':
      return { ...state, cardInfo: { ...state.cardInfo, ...action.payload } }
    case 'SET_CPF':
      return { ...state, cpf: action.payload }
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, STEPS.length - 1) }
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 0) }
    case 'GO_TO_STEP':
      return { ...state, step: action.payload }
    case 'PLACE_ORDER':
      return { ...state, orderPlaced: true, orderNumber: `#LV${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}` }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

export function CheckoutProvider({ children }) {
  const { state: cart, dispatch: cartDispatch } = useCart()
  const [checkoutState, checkoutDispatch] = useReducer(checkoutReducer, initialState)

  const stepLabel = STEPS[checkoutState.step]
  const isLastStep = checkoutState.step === STEPS.length - 1

  const calculateShipping = (cep) => {
    const options = [
      { id: 'sedex', label: 'Sedex', days: '1-2', price: 19.90 },
      { id: 'pac', label: 'PAC', days: '5-10', price: 9.90 },
      { id: 'express', label: 'Express', days: '1', price: 34.90 },
    ]
    checkoutDispatch({ type: 'SET_SHIPPING_OPTIONS', payload: options })
    const freeShipping = cart.totalPrice >= 199
    checkoutDispatch({ type: 'SET_SHIPPING_METHOD', payload: freeShipping ? { id: 'gratis', label: 'Frete Grátis', days: '3-7', price: 0 } : options[0] })
  }

  const value = {
    checkout: checkoutState,
    dispatch: checkoutDispatch,
    stepLabel,
    isLastStep,
    calculateShipping,
    cart,
    steps: STEPS,
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider')
  return context
}
