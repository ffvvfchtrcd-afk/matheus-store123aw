import { Link } from 'react-router-dom'
import { getBrandImage } from '../../utils/images'

export function BrandGrid({ gender, subcategory, brands }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
      {(brands || []).map((brand) => {
        const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]/g, '-')
        return (
          <Link
            key={brand}
            to={`/${gender}/${subcategory}/${brandSlug}`}
            className="group relative overflow-hidden rounded-2xl bg-surface-secondary border border-border aspect-square flex flex-col items-center justify-center p-6 hover:border-text-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <img
              src={getBrandImage(brand)}
              alt={brand}
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
            />
            <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-accent transition-colors text-center">
              {brand}
            </h3>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
        )
      })}
    </div>
  )
}
