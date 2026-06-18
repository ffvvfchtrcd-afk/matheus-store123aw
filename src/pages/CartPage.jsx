import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { CartItem } from '../components/cart/CartItem'
import { CartSummary } from '../components/cart/CartSummary'
import { ArrowLeftIcon, ShieldIcon, CreditCardIcon, TruckIcon } from '../components/ui/Icons'
import { EmptyCartIllustration } from '../components/ui/Illustrations'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
  const { state, totalItems, totalPrice, total, shipping, dispatch } = useCart()

  if (state.items.length === 0) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={EmptyCartIllustration}
          title="Seu carrinho está vazio"
          description="Adicione produtos para começar suas compras."
          actionLabel="Ver Produtos"
          actionLink="/"
        />
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Início', path: '/' }, { label: 'Carrinho' }]} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Carrinho
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_CART' })}
          className="text-sm text-text-muted hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-secondary"
        >
          Limpar Carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-secondary border border-accent/30 rounded-xl divide-y divide-border shadow-[0_0_10px_rgba(232,184,74,0.08)]">
            {state.items.map((item) => (
              <CartItem key={item.variantId} item={item} />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="inline-flex items-center gap-2">
                <ArrowLeftIcon className="w-4 h-4" />
                Continuar Comprando
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="flex items-center gap-2.5 text-xs text-text-muted p-3 rounded-lg bg-surface-secondary border border-accent/25">
              <ShieldIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Compra segura com certificado SSL</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-text-muted p-3 rounded-lg bg-surface-secondary border border-accent/25">
              <TruckIcon className="w-4 h-4 text-accent/70 flex-shrink-0" />
              <span>Frete grátis acima de R$ 199</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-text-muted p-3 rounded-lg bg-surface-secondary border border-accent/25">
              <CreditCardIcon className="w-4 h-4 text-accent/70 flex-shrink-0" />
              <span>Parcele em até 12x sem juros</span>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummary totalPrice={totalPrice} shipping={shipping} total={total} />
        </div>
      </div>
    </Container>
  )
}
