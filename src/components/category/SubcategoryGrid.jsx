import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../ui/Icons'
import { getSubcategoryImage } from '../../utils/images'

export function SubcategoryGrid({ gender, subcategories }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
      {(subcategories || []).map((sub) => (
        <Link
          key={sub.slug}
          to={`/${gender}/${sub.slug}`}
          className="group relative overflow-hidden rounded-2xl bg-surface-secondary border border-border aspect-square flex flex-col items-center justify-center p-6 hover:border-text-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="w-full h-full absolute inset-0 opacity-[0.04]">
            <img
              src={getSubcategoryImage(sub.slug, gender)}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-xl bg-surface-tertiary flex items-center justify-center mb-4 group-hover:bg-surface-hover transition-colors duration-300">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d={getSubcategoryIcon(sub.slug)} />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors">
              {sub.label}
            </h3>
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-text-muted group-hover:text-text-secondary transition-colors">
              Ver Produtos
              <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
      ))}
    </div>
  )
}

function getSubcategoryIcon(slug) {
  const icons = {
    'calcas': 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'camisetas': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    'tenis': 'M13 10V3L4 14h7v7l9-11h-7z',
    'cuecas': 'M3 7l6-4 6 4v10l-6 4-6-4V7z',
    'relogios': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'calcas-shorts': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    'vestidos': 'M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z',
    'sapatos': 'M5 12h14M12 5l7 7-7 7',
    'saltos': 'M3 21h18M3 10h18M5 6l7-4 7 4M4 10v11M20 10v11',
    'blusas': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343',
    'acessorios': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  }
  return icons[slug] || icons['camisetas']
}
