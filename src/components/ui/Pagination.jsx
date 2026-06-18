import { ChevronDownIcon } from './Icons'

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Navegação de páginas">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-surface-secondary"
        aria-label="Página anterior"
      >
        <ChevronDownIcon className="w-5 h-5 rotate-90" />
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-9 h-9 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
          >
            1
          </button>
          {start > 2 && <span className="w-9 h-9 flex items-center justify-center text-sm text-text-muted">...</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 text-sm rounded-lg transition-colors ${
            page === currentPage
              ? 'bg-accent text-black font-bold'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-sm text-text-muted">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-9 h-9 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-surface-secondary"
        aria-label="Próxima página"
      >
        <ChevronDownIcon className="w-5 h-5 -rotate-90" />
      </button>
    </nav>
  )
}
