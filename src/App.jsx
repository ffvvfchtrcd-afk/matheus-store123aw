import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import { DatabaseProvider } from './context/DatabaseContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { Layout } from './components/layout/Layout'
import { AdminLayout } from './pages/admin/AdminLayout'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Button } from './components/ui/Button'
import { NotFoundIllustration } from './components/ui/Illustrations'

const Home = lazy(() => import('./pages/Home'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const OrderHistory = lazy(() => import('./pages/OrderHistory'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const SalePage = lazy(() => import('./pages/SalePage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'))
const AdminModels = lazy(() => import('./pages/admin/AdminModels'))
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'))
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <NotFoundIllustration className="w-48 h-48 mb-8" />
      <h1 className="text-4xl font-bold text-text-primary mb-2">Página não encontrada</h1>
      <p className="text-text-secondary mb-8 max-w-sm">A página que você procura não existe ou foi movida.</p>
      <Button variant="primary" asChild>
        <a href="/">Voltar ao Início</a>
      </Button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <DatabaseProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="ofertas" element={<SalePage />} />
                        <Route path="favoritos" element={<WishlistPage />} />
                        <Route path=":gender" element={<CategoryPage />} />
                        <Route path=":gender/:subcategory" element={<CategoryPage />} />
                        <Route path=":gender/:subcategory/:brand" element={<CategoryPage />} />
                        <Route path="produto/:slug" element={<ProductDetail />} />
                        <Route path="carrinho" element={<CartPage />} />
                        <Route path="checkout" element={<CheckoutPage />} />
                        <Route path="busca" element={<SearchResults />} />
                        <Route path="pedidos" element={<OrderHistory />} />
                        <Route path="pedido/:numero" element={<OrderDetail />} />
                        <Route path="entrar" element={<LoginPage />} />
                        <Route path="cadastrar" element={<RegisterPage />} />
                        <Route path="fale-conosco" element={<SupportPage />} />
                        <Route path="fale-conosco/:ticketId" element={<SupportPage />} />
                      </Route>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="pedidos" element={<AdminOrders />} />
                        <Route path="pedido/:numero" element={<AdminOrderDetail />} />
                        <Route path="produtos" element={<AdminModels />} />
                        <Route path="newsletter" element={<AdminNewsletter />} />
                        <Route path="tickets" element={<AdminTickets />} />
                      <Route path="categorias" element={<AdminCategories />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </DatabaseProvider>
    </BrowserRouter>
  )
}

export default App
