import { useState, useMemo } from 'react'

export function usePagination(items, itemsPerPage = 12) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil((items || []).length / itemsPerPage))

  const safePage = Math.min(currentPage, totalPages)
  if (safePage !== currentPage) {
    setCurrentPage(safePage)
  }

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage
    return (items || []).slice(start, start + itemsPerPage)
  }, [items, safePage, itemsPerPage])

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    goToPage,
    setCurrentPage: goToPage,
  }
}
