import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseIcon, StarIcon, TruckIcon, ReturnIcon } from '../ui/Icons'
import { Button } from '../ui/Button'
import { QuantitySelector } from './QuantitySelector'
import { generateProductPlaceholder } from '../../utils/images'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getModelBySlug } from '../../db/modelRepo'

export function QuickViewModal({ slug, onClose }) {
  const navigate = useNavigate()
  const { dispatch } = useCart()
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!slug) return
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const m = await getModelBySlug(slug)
        if (mounted) {
          setModel(m)
          const sizes = [...new Set((m.variants || []).map((v) => v.size))]
          const colors = [...new Set((m.variants || []).map((v) => v.color))]
          setSelectedSize(sizes[0] || '')
          setSelectedColor(colors[0] || '')
        }
      } catch {}
      if (mounted) setLoading(false)
    })()
    return () => { mounted = false }
  }, [slug])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const variant = model?.variants?.find((v) => v.size === selectedSize && v.color === selectedColor)
  const inStock = variant ? variant.stock > 0 : false
  const price = variant?.price || 0
  const originalPrice = variant?.originalPrice || 0
  const hasDiscount = originalPrice > price

  const handleAdd = () => {
    if (!variant || !model) return
    if (!isAuthenticated) {
      navigate(`/entrar?redirect=/produto/${model.slug}`)
      return
    }
    dispatch({ type: 'ADD_ITEM', payload: { model, variant, quantity } })
    addToast(`${model.name} (${selectedSize}, ${selectedColor}) adicionado ao carrinho!`, 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Visualização rápida">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-secondary border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-surface/80 rounded-full text-text-secondary hover:text-text-primary transition-colors" aria-label="Fechar">
          <CloseIcon className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="aspect-[4/5] bg-surface-tertiary rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-surface-tertiary rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-surface-tertiary rounded animate-pulse" />
              <div className="h-8 w-1/3 bg-surface-tertiary rounded animate-pulse" />
              <div className="h-20 bg-surface-tertiary rounded animate-pulse" />
              <div className="h-10 bg-surface-tertiary rounded animate-pulse" />
            </div>
          </div>
        ) : !model ? (
          <div className="p-12 text-center text-text-muted">Produto não encontrado</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-tertiary">
              <img
                src={model.colorImages?.[selectedColor] || model.images?.[0] || generateProductPlaceholder(model.name, selectedColor || '#3b82f6')}
                alt={model.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">{model.brand}</p>
                <h2 className="text-xl font-bold text-text-primary">{model.name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} className={`w-3.5 h-3.5 ${s <= Math.round(model.rating || 4.5) ? 'text-yellow-500' : 'text-text-muted opacity-30'}`} />
                  ))}
                  <span className="text-xs text-text-secondary ml-1">{model.rating || 4.5}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary">
                  {price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-text-muted line-through">
                    {originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                )}
              </div>

              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{model.description}</p>

              {[...new Set((model.variants || []).map((v) => v.color))].length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-1.5">Cor: <span className="font-normal text-text-secondary">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set((model.variants || []).map((v) => v.color))].map((color) => (
                      <button key={color} onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                          selectedColor === color ? 'bg-accent text-black border-accent' : 'border-border text-text-secondary hover:border-text-muted'
                        }`}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {[...new Set((model.variants || []).map((v) => v.size))].length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-text-primary mb-1.5">Tamanho: <span className="font-normal text-text-secondary">{selectedSize}</span></h3>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set((model.variants || []).map((v) => v.size))].map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)}
                        disabled={!(model.variants || []).some((v) => v.size === size && v.stock > 0)}
                        className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                          selectedSize === size ? 'bg-accent text-black border-accent' : 'border-border text-text-secondary hover:border-text-muted disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-text-primary">Qtd:</span>
                <QuantitySelector quantity={quantity} onChange={setQuantity} className="h-8" />
              </div>

              <div className="flex gap-2">
                <Button variant="primary" size="sm" fullWidth onClick={handleAdd} disabled={!inStock} className="text-xs">
                  {inStock ? `Adicionar — ${(price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : 'Indisponível'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { onClose(); navigate(`/produto/${model.slug}`) }} className="text-xs">
                  Ver Mais
                </Button>
              </div>

              <div className="flex gap-3 text-xs text-text-muted pt-2 border-t border-border">
                <span className="flex items-center gap-1"><TruckIcon className="w-3.5 h-3.5 text-green-500" /> Frete Grátis</span>
                <span className="flex items-center gap-1"><ReturnIcon className="w-3.5 h-3.5 text-accent/70" /> Devolução 30d</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
