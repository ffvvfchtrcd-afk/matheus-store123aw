import { Link } from 'react-router-dom'

export function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
      {(items || []).map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <span>/</span>}
            {isLast ? (
              <span className="text-text-secondary">{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-text-primary transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
