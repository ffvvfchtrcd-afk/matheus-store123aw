import { Component } from 'react'
import { Button } from './Button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <span className="text-3xl text-red-500">!</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Algo deu errado</h1>
          <p className="text-text-secondary mb-8 max-w-sm">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
            <Button variant="secondary" onClick={() => this.setState({ hasError: false, error: null })}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
