import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { CartItem } from '../components/cart/CartItem'
import { TruckIcon, MapPinIcon, CreditCardIcon, CheckIcon, PackageIcon, ArrowLeftIcon } from '../components/ui/Icons'
import { formatCurrency } from '../utils/formatCurrency'
import { fireConfetti } from '../utils/confetti'
import { useCart } from '../hooks/useCart'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { saveOrder } from '../db/orderRepo'

const STEPS = [
  { key: 'endereco', label: 'Endereço', icon: MapPinIcon },
  { key: 'frete', label: 'Frete', icon: TruckIcon },
  { key: 'pagamento', label: 'Pagamento', icon: CreditCardIcon },
  { key: 'revisao', label: 'Revisão', icon: PackageIcon },
]

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export default function CheckoutPage() {
  const { state: cart, totalPrice, dispatch: cartDispatch } = useCart()
  const { addToast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [viacepLoading, setViacepLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/entrar?redirect=/checkout')
    }
  }, [isAuthenticated, navigate])

  const [address, setAddress] = useState({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' })
  const [shippingMethod, setShippingMethod] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [cpf, setCpf] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const shippingOptions = [
    { id: 'sedex', label: 'Sedex', days: '1-2 dias úteis', price: 19.90 },
    { id: 'pac', label: 'PAC', days: '5-10 dias úteis', price: 9.90 },
    { id: 'express', label: 'Express', days: '1 dia útil', price: 34.90 },
  ]

  const freeShipping = totalPrice >= 199
  const shipping = shippingMethod ? shippingMethod.price : (freeShipping ? 0 : 14.90)
  const total = totalPrice + shipping

  const handleCepBlur = async () => {
    const cep = address.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    setViacepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setAddress((a) => ({
          ...a,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        }))
      } else {
        addToast('CEP não encontrado.', 'error')
      }
    } catch {
      addToast('Erro ao buscar CEP. Preencha manualmente.', 'error')
    }
    setViacepLoading(false)
  }

  const handlePlaceOrder = async () => {
    const num = `#LV${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    setOrderNumber(num)
    setOrderPlaced(true)
    fireConfetti(4000)

    const order = {
      orderNumber: num,
      username: user?.username || null,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      items: cart.items.map((item) => ({
        variantId: item.variantId,
        modelSlug: item.modelSlug,
        name: item.name,
        brand: item.brand,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      address: { ...address },
      shipping: {
        method: shippingMethod?.label || 'Frete Grátis',
        price: shipping,
        days: shippingMethod?.days || '3-7 dias úteis',
      },
      payment: {
        method: paymentMethod,
        cardLastDigits: paymentMethod === 'credit' ? cardInfo.number.slice(-4) : null,
      },
      subtotal: totalPrice,
      shippingCost: shipping,
      total,
      cpf,
    }

    try {
      await saveOrder(order)
      addToast('Pedido realizado com sucesso!', 'success')
    } catch {
      addToast('Erro ao salvar pedido. Tente novamente.', 'error')
    }

    cartDispatch({ type: 'CLEAR_CART' })
  }

  const canProceed = () => {
    if (step === 0) return address.cep && address.logradouro && address.numero && address.bairro && address.cidade && address.estado
    if (step === 1) return shippingMethod || freeShipping
    if (step === 2) {
      if (!paymentMethod) return false
      if (paymentMethod === 'credit') return cardInfo.number && cardInfo.name && cardInfo.expiry && cardInfo.cvv && cpf
      return !!cpf
    }
    return true
  }

  if (orderPlaced) {
    return (
      <Container className="py-20 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Pedido Confirmado!</h1>
        <p className="text-text-secondary mb-2">Seu pedido {orderNumber} foi realizado com sucesso.</p>
        <p className="text-sm text-text-muted mb-8">Você receberá um e-mail com os detalhes da entrega.</p>

        <div className="bg-surface-secondary border border-border rounded-xl p-6 text-left mb-8 space-y-3">
          <h3 className="font-semibold text-text-primary">Resumo da Entrega</h3>
          <div className="text-sm text-text-secondary space-y-1">
            <p>{address.logradouro}, {address.numero}{address.complemento ? ` - ${address.complemento}` : ''}</p>
            <p>{address.bairro} - {address.cidade}/{address.estado}</p>
            <p>CEP: {address.cep}</p>
          </div>
          <div className="border-t border-border pt-3 text-sm text-text-secondary">
            <p>Frete: {shippingMethod?.label || 'Frete Grátis'} — {formatCurrency(shipping)}</p>
            <p>Pagamento: {paymentMethod === 'credit' ? 'Cartão de Crédito' : paymentMethod === 'boleto' ? 'Boleto Bancário' : 'PIX'}</p>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-text-primary">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
          <Button variant="primary" onClick={() => navigate('/masculino')}>
            Continuar Comprando
          </Button>
          <Button variant="ghost" onClick={() => navigate('/pedidos')}>
            Meus Pedidos
          </Button>
        </div>
      </Container>
    )
  }

  if (cart.items.length === 0 && !orderPlaced) {
    navigate('/carrinho')
    return null
  }

  return (
    <Container className="py-8">
      <Breadcrumb items={[
        { label: 'Início', path: '/' },
        { label: 'Carrinho', path: '/carrinho' },
        { label: 'Checkout' },
      ]} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-8">Checkout</h1>

        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step
            const isDone = i < step
            return (
              <div key={s.key} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive ? 'bg-accent text-black' : isDone ? 'text-green-500' : 'text-text-muted'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : ''}`} />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${i < step ? 'bg-green-500' : 'bg-border'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {step === 0 && (
              <div className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-accent/70" />
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1">CEP</label>
                    <div className="relative">
                      <input
                        value={address.cep}
                        onChange={(e) => setAddress((a) => ({ ...a, cep: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                        onBlur={handleCepBlur}
                        placeholder="00000-000"
                        maxLength={8}
                        className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                      />
                      {viacepLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1">Número</label>
                    <input
                      value={address.numero}
                      onChange={(e) => setAddress((a) => ({ ...a, numero: e.target.value }))}
                      placeholder="123"
                      className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-text-muted mb-1">Logradouro</label>
                    <input
                      value={address.logradouro}
                      onChange={(e) => setAddress((a) => ({ ...a, logradouro: e.target.value }))}
                      placeholder="Rua, Avenida..."
                      className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-text-muted mb-1">Complemento</label>
                    <input
                      value={address.complemento}
                      onChange={(e) => setAddress((a) => ({ ...a, complemento: e.target.value }))}
                      placeholder="Apto, Bloco, Sala (opcional)"
                      className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1">Bairro</label>
                    <input
                      value={address.bairro}
                      onChange={(e) => setAddress((a) => ({ ...a, bairro: e.target.value }))}
                      placeholder="Centro"
                      className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1">Cidade</label>
                    <input
                      value={address.cidade}
                      onChange={(e) => setAddress((a) => ({ ...a, cidade: e.target.value }))}
                      placeholder="São Paulo"
                      className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1">Estado</label>
                    <select
                      value={address.estado}
                      onChange={(e) => setAddress((a) => ({ ...a, estado: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-text-muted transition-colors"
                    >
                      <option value="">Selecione</option>
                      {ESTADOS.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-accent/70" />
                  Método de Entrega
                </h2>
                {freeShipping && (
                  <div
                    onClick={() => setShippingMethod({ id: 'gratis', label: 'Frete Grátis', days: '3-7 dias úteis', price: 0 })}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod?.id === 'gratis' ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      shippingMethod?.id === 'gratis' ? 'border-accent' : 'border-text-muted'
                    }`}>
                      {shippingMethod?.id === 'gratis' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">Frete Grátis</p>
                      <p className="text-xs text-text-muted">3-7 dias úteis</p>
                    </div>
                    <span className="font-bold text-green-500">Grátis</span>
                  </div>
                )}
                {shippingOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setShippingMethod(opt)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod?.id === opt.id ? 'border-accent bg-accent/5' : 'border-border hover:border-text-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      shippingMethod?.id === opt.id ? 'border-accent' : 'border-text-muted'
                    }`}>
                      {shippingMethod?.id === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{opt.label}</p>
                      <p className="text-xs text-text-muted">{opt.days}</p>
                    </div>
                    <span className="font-bold text-text-primary">{formatCurrency(opt.price)}</span>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5 text-accent/70" />
                    Forma de Pagamento
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'credit', label: 'Cartão de Crédito' },
                      { id: 'boleto', label: 'Boleto Bancário' },
                      { id: 'pix', label: 'PIX' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                          paymentMethod === method.id
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-text-primary">CPF do Comprador</h3>
                  <input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors max-w-xs"
                  />
                </div>

                {paymentMethod === 'credit' && (
                  <div className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary">Dados do Cartão</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">Número do Cartão</label>
                        <input
                          value={cardInfo.number}
                          onChange={(e) => setCardInfo((c) => ({ ...c, number: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                          placeholder="**** **** **** ****"
                          maxLength={16}
                          className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">Nome no Cartão</label>
                        <input
                          value={cardInfo.name}
                          onChange={(e) => setCardInfo((c) => ({ ...c, name: e.target.value }))}
                          placeholder="Nome como está no cartão"
                          className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">Validade</label>
                          <input
                            value={cardInfo.expiry}
                            onChange={(e) => setCardInfo((c) => ({ ...c, expiry: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            placeholder="MM/AA"
                            maxLength={4}
                            className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-muted mb-1">CVV</label>
                          <input
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                            placeholder="***"
                            maxLength={3}
                            className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className="bg-surface-secondary border border-border rounded-xl p-8 text-center">
                    <p className="text-text-secondary mb-2">Ao finalizar, geraremos um QR Code PIX para pagamento.</p>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div className="bg-surface-secondary border border-border rounded-xl p-8 text-center">
                    <p className="text-text-secondary mb-2">O boleto será gerado após a confirmação do pedido.</p>
                    <p className="text-xs text-text-muted">Vencimento em 3 dias úteis.</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <PackageIcon className="w-5 h-5 text-accent/70" />
                    Revisão do Pedido
                  </h2>

                  <div className="space-y-3">
                    <div className="border border-border rounded-lg p-4">
                      <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Endereço de Entrega</h4>
                      <p className="text-sm text-text-primary">{address.logradouro}, {address.numero}{address.complemento ? ` - ${address.complemento}` : ''}</p>
                      <p className="text-sm text-text-secondary">{address.bairro} - {address.cidade}/{address.estado}</p>
                      <p className="text-sm text-text-secondary">CEP: {address.cep}</p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Frete</h4>
                      <p className="text-sm text-text-primary">{shippingMethod?.label || 'Frete Grátis'} — {formatCurrency(shipping)}</p>
                      <p className="text-xs text-text-muted">{shippingMethod?.days || '3-7 dias úteis'}</p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Pagamento</h4>
                      <p className="text-sm text-text-primary">
                        {paymentMethod === 'credit' ? `Cartão de Crédito - Final ${cardInfo.number.slice(-4)}` :
                         paymentMethod === 'boleto' ? 'Boleto Bancário' : 'PIX'}
                      </p>
                      <p className="text-xs text-text-muted">CPF: {cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3.$4')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-secondary border border-border rounded-xl divide-y divide-border">
                  {cart.items.map((item) => (
                    <CartItem key={item.variantId} item={item} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link to="/carrinho" className="inline-flex items-center gap-2">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Voltar ao Carrinho
                  </Link>
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (step < 3) {
                    setStep(step + 1)
                  } else {
                    handlePlaceOrder()
                  }
                }}
                disabled={!canProceed()}
              >
                {step === 3 ? 'Confirmar e Finalizar Pedido' : 'Continuar'}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface-secondary border border-border rounded-xl p-5 space-y-3 sticky top-24">
              <h3 className="text-sm font-semibold text-text-primary">Resumo</h3>
              <div className="space-y-2 text-sm">
                {cart.items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <img
                      src={item.image?.startsWith('http') ? item.image : ''}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-surface-tertiary flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.size} / {item.color} × {item.quantity}</p>
                      <p className="text-xs font-bold text-text-primary">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Frete</span>
                  <span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-text-primary border-t border-border pt-1.5">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
