import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'
import { TruckIcon, ShieldIcon, CreditCardIcon } from '../ui/Icons'

export function CartSummary({ totalPrice, shipping, total, subtotal }) {
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'BEMVINDO10') {
      setCouponApplied(true)
    }
  }

  return (
    <div className="bg-surface-secondary border border-border rounded-xl p-6 space-y-5 sticky top-24">
      <h3 className="text-lg font-semibold text-text-primary">Resumo do Pedido</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal ({subtotal || totalPrice} itens)</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>

        {couponApplied && (
          <div className="flex justify-between text-green-500">
            <span>Desconto (BEMVINDO10)</span>
            <span>-{formatCurrency(totalPrice * 0.1)}</span>
          </div>
        )}

        <div className="flex justify-between text-text-secondary">
          <span className="flex items-center gap-1.5">
            <TruckIcon className="w-4 h-4" />
            Frete
          </span>
          <span className={shipping === 0 ? 'text-green-500 font-medium' : 'text-text-secondary'}>
            {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
          </span>
        </div>

        {totalPrice < 199 && totalPrice > 0 && (
          <p className="text-xs text-text-muted bg-surface-tertiary rounded-lg p-2">
            Faltam {formatCurrency(199 - totalPrice)} para frete grátis
          </p>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex justify-between text-base font-bold text-text-primary">
          <span>Total</span>
          <span>{formatCurrency(couponApplied ? total - totalPrice * 0.1 : total)}</span>
        </div>
        <p className="text-xs text-text-muted mt-1">Em até 12x sem juros</p>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Cupom de desconto"
            className="flex-1 px-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
          />
          <Button variant="secondary" size="sm" onClick={handleApplyCoupon} disabled={!coupon.trim()}>
            {couponApplied ? 'Aplicado' : 'Aplicar'}
          </Button>
        </div>
        {couponApplied && (
          <p className="text-xs text-green-500 mt-1">Cupom BEMVINDO10 aplicado! 10% de desconto.</p>
        )}
      </div>

      <Button variant="primary" size="lg" fullWidth asChild>
        <Link to="/checkout">Ir para Checkout</Link>
      </Button>

      <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <ShieldIcon className="w-3.5 h-3.5" />
          Compra Segura
        </span>
        <span className="flex items-center gap-1">
          <CreditCardIcon className="w-3.5 h-3.5" />
          Pagamento 100%
        </span>
      </div>
    </div>
  )
}
