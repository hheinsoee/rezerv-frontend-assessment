import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { IconButton, Select } from '../ui/primitives'

export interface TablePaginationProps {
  page: number
  pageCount: number
  pageSize: number
  pageSizeOptions: number[]
  total: number
  rowOffset: number
  rowsOnPage: number
  disabled: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  total,
  rowOffset,
  rowsOnPage,
  disabled,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const last = rowOffset === 0 ? 0 : rowOffset + rowsOnPage - 1

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3"
    >
      <p className="text-sm text-slate-500" role="status">
        {total === 0 ? 'No rows' : `${rowOffset}–${last} of ${total}`}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 sm:inline">Rows</span>
          <Select
            label="Rows per page"
            value={pageSize}
            disabled={disabled}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            label="First page"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft className="size-4" />
          </IconButton>
          <IconButton
            label="Previous page"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </IconButton>

          <span className="px-2 text-sm whitespace-nowrap text-slate-600">
            {page} / {pageCount}
          </span>

          <IconButton
            label="Next page"
            disabled={disabled || page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </IconButton>
          <IconButton
            label="Last page"
            disabled={disabled || page >= pageCount}
            onClick={() => onPageChange(pageCount)}
          >
            <ChevronsRight className="size-4" />
          </IconButton>
        </div>
      </div>
    </nav>
  )
}
