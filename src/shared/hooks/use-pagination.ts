import { useState } from 'react'

interface PaginationOptions {
  pageSize?: number
}

export function usePagination({ pageSize = 20 }: PaginationOptions = {}) {
  const [page, setPage] = useState(0)

  return {
    page,
    pageSize,
    from: page * pageSize,
    to: page * pageSize + pageSize - 1,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(0, p - 1)),
    goToPage: setPage,
    resetPage: () => setPage(0),
  }
}
