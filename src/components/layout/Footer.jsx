import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { Logotype } from '../ui/Icons'
import categories from '../../data/categories.json'

export function Footer() {
  return (
    <footer className="bg-surface border-t border-accent/35 shadow-[0_-2px_15px_rgba(232,184,74,0.1)] mt-20 pb-20 md:pb-0">
      <Container className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-block">
              <Logotype className="h-6" />
            </Link>
            <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-xs">
              Moda masculina e feminina com estilo, conforto e qualidade. Sua loja de confiança desde 2025.
            </p>
            <div className="mt-4 flex gap-3">
              <Link to="/ofertas" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                Ofertas
              </Link>
              <Link to="/favoritos" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Favoritos
              </Link>
            </div>
          </div>

          {categories.map((cat) => (
            <div key={cat.slug}>
              <h3 className="text-sm font-semibold text-text-primary mb-3">{cat.label}</h3>
              <ul className="space-y-2">
                {cat.subcategories.map((sub) => (
                  <li key={sub.slug}>
                    <Link
                      to={`/${cat.slug}/${sub.slug}`}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                      {sub.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to={`/${cat.slug}`}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
                  >
                    Ver Tudo →
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Loja JM. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/ofertas" className="text-xs text-text-muted hover:text-accent transition-colors">Ofertas</Link>
            <Link to="/fale-conosco" className="text-xs text-text-muted hover:text-text-primary transition-colors">Fale Conosco</Link>
            <span className="text-xs text-text-muted">Feito com dedicação</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
