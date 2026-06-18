import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { UserIcon } from '../components/ui/Icons'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(searchParams.get('redirect') || '/', { replace: true })
    }
  }, [isAuthenticated])

  if (isAuthenticated) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return
    setLoading(true)
    try {
      await login(username, password)
      addToast('Login realizado com sucesso!', 'success')
      navigate(searchParams.get('redirect') || '/')
    } catch (err) {
      addToast(err.message, 'error')
    }
    setLoading(false)
  }

  return (
    <Container className="py-20 max-w-md mx-auto">
      <div className="text-center mb-8">
        <UserIcon className="w-12 h-12 mx-auto text-accent mb-4" />
        <h1 className="text-2xl font-bold text-text-primary">Entrar</h1>
        <p className="text-sm text-text-secondary mt-1">Acesse sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-secondary border border-border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Usuário</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Seu usuário"
            className="w-full px-3 py-2.5 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pr-10 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>
        <Button variant="primary" fullWidth type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Não tem conta?{' '}
        <Link to={`/cadastrar${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`} className="text-accent hover:underline">
          Criar conta
        </Link>
      </p>
    </Container>
  )
}
