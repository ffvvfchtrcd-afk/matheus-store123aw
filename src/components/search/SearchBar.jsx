import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SearchIcon, CloseIcon } from '../ui/Icons'
import { useSearch } from '../../hooks/useSearch'

export function SearchBar({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()
  const { results, loading } = useSearch(focused ? debouncedQuery : '')

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const suggestions = results.slice(0, 5)

  useEffect(() => {
    if (!open) { setQuery(''); setDebouncedQuery('') }
  }, [open])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim().length < 2) return
    navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
    setOpen(false)
    setFocused(false)
    onNavigate?.()
  }

  const handleSuggestionClick = () => {
    setOpen(false)
    setFocused(false)
    onNavigate?.()
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100) }}
        className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Buscar"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Buscar produtos..."
            className="w-full pl-9 pr-3 py-2 bg-surface-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-text-muted transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </form>

      {focused && debouncedQuery.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-secondary border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-sm text-text-muted text-center">Buscando...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-sm text-text-muted text-center">Nenhum resultado encontrado</div>
          ) : (
            suggestions.map((m) => (
              <Link
                key={m.slug}
                to={`/produto/${m.slug}`}
                onClick={handleSuggestionClick}
                className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
              >
                <span className="font-medium text-text-primary truncate flex-1">{m.name}</span>
                <span className="text-xs text-text-muted flex-shrink-0">{m.brand}</span>
              </Link>
            ))
          )}
          {results.length > 5 && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSubmit(e) }}
              className="w-full px-4 py-2.5 text-sm text-accent border-t border-border hover:bg-surface-hover transition-colors text-center font-medium"
            >
              Ver todos os {results.length} resultados
            </button>
          )}
        </div>
      )}
    </div>
  )
}
