import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ModelCard } from './ModelCard'
import { ArrowRightIcon } from '../ui/Icons'

export function ProductCarousel({ title, subtitle, models, loading, viewAllLink, viewAllLabel = 'Ver Todos' }) {
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const scrollLeftVal = useRef(0)
  const didDrag = useRef(false)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    didDrag.current = false
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeftVal.current = scrollRef.current.scrollLeft
  }
  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const diff = Math.abs(x - startX.current)
    if (diff > 5) didDrag.current = true
    scrollRef.current.scrollLeft = scrollLeftVal.current - (x - startX.current) * 1.5
  }
  const handleMouseUp = () => setIsDragging(false)

  const handleClick = (e) => {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (loading) {
    return (
      <div className="pb-8">
        <div className="h-8 w-48 bg-surface-secondary rounded animate-pulse mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[200px] h-[280px] bg-surface-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!models || models.length === 0) return null

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {viewAllLabel}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-none select-none cursor-grab active:cursor-grabbing -mx-4 px-4 sm:mx-0 sm:px-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {models.map((model) => (
          <div key={model.slug} className="flex-shrink-0 w-[180px] sm:w-[200px]" onClick={handleClick}>
            <ModelCard model={model} />
          </div>
        ))}
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex-shrink-0 w-[140px] flex items-center justify-center rounded-xl border-2 border-dashed border-accent/30 hover:border-accent/60 hover:bg-accent/5 transition-all text-accent"
          >
            <div className="text-center">
              <ArrowRightIcon className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium">{viewAllLabel}</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
