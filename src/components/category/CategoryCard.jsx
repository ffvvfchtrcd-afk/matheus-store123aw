import { Link } from 'react-router-dom'
import { getCategoryImage } from '../../utils/images'
import { ArrowRightIcon } from '../ui/Icons'

export function CategoryCard({ category, slug }) {
  return (
    <Link
      to={`/${slug}`}
      className="group relative overflow-hidden rounded-2xl bg-surface-secondary min-h-[300px] sm:min-h-[400px] flex items-end block border border-accent/30 group-hover:border-accent/70 shadow-[0_0_12px_rgba(232,184,74,0.1)] group-hover:shadow-[0_0_30px_rgba(232,184,74,0.3)] transition-all duration-300"
    >
      <img
        src={getCategoryImage(slug)}
        alt={category.label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="relative p-6 sm:p-8 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">{category.label}</h2>
        <p className="text-sm text-text-secondary mb-4">{category.description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-accent bg-accent/10 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-accent/20 transition-all duration-200">
          Ver Coleção
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
