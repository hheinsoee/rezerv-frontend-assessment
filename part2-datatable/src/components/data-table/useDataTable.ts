import { useCallback, useEffect, useMemo } from 'react'
import type { ColumnDef, SortState } from './types'
import { useControllableState } from './useControllableState'

export interface UseDataTableOptions<TRow> {
  data: TRow[]
  columns: ColumnDef<TRow, any>[]

  sort?: SortState | null
  defaultSort?: SortState | null
  onSortChange?: (sort: SortState | null) => void

  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void

  pageSize?: number
  defaultPageSize?: number
  onPageSizeChange?: (pageSize: number) => void

  totalRows?: number

  manualSort?: boolean
}

export interface DataTableModel<TRow> {
  rows: TRow[]

  sort: SortState | null
  toggleSort: (columnId: string) => void
  page: number
  pageSize: number
  pageCount: number
  total: number

  rowOffset: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  isServerPaginated: boolean
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export function getCellValue<TRow>(row: TRow, column: ColumnDef<TRow, any>): unknown {
  const { accessor } = column
  if (accessor === undefined) return undefined
  return typeof accessor === 'function' ? accessor(row) : row[accessor]
}

export function useDataTable<TRow>(options: UseDataTableOptions<TRow>): DataTableModel<TRow> {
  const {
    data,
    columns,
    sort,
    defaultSort = null,
    onSortChange,
    page,
    defaultPage = 1,
    onPageChange,
    pageSize,
    defaultPageSize = 10,
    onPageSizeChange,
    totalRows,
    manualSort = false,
  } = options

  const [sortState, setSortState] = useControllableState<SortState | null>({
    value: sort,
    defaultValue: defaultSort,
    onChange: onSortChange,
  })
  const [pageState, setPageState] = useControllableState<number>({
    value: page,
    defaultValue: defaultPage,
    onChange: onPageChange,
  })
  const [pageSizeState, setPageSizeState] = useControllableState<number>({
    value: pageSize,
    defaultValue: defaultPageSize,
    onChange: onPageSizeChange,
  })

  const columnsById = useMemo(() => {
    const lookup: Record<string, ColumnDef<TRow, any>> = {}
    for (const column of columns) lookup[column.id] = column
    return lookup
  }, [columns])

  const activeSort = useMemo(() => {
    if (!sortState) return null
    const column = columnsById[sortState.columnId]
    return column?.sortable ? sortState : null
  }, [sortState, columnsById])

  const sortedRows = useMemo(() => {
    if (manualSort || !activeSort) return data
    const column = columnsById[activeSort.columnId]
    if (!column) return data

    const factor = activeSort.direction === 'asc' ? 1 : -1
    const { sortFn } = column

    return [...data].sort((a, b) => {
      if (sortFn) return sortFn(a, b) * factor
      const left = getCellValue(a, column)
      const right = getCellValue(b, column)
      const leftEmpty = left === null || left === undefined || left === ''
      const rightEmpty = right === null || right === undefined || right === ''
      if (leftEmpty || rightEmpty) {
        if (leftEmpty && rightEmpty) return 0
        return leftEmpty ? 1 : -1
      }
      return compareValues(left, right) * factor
    })
  }, [data, activeSort, manualSort, columnsById])

  const isServerPaginated = totalRows !== undefined
  const total = totalRows ?? sortedRows.length
  const safePageSize = Math.max(1, Math.floor(pageSizeState) || 1)
  const pageCount = Math.max(1, Math.ceil(total / safePageSize))

  const safePage = Math.min(Math.max(1, Math.floor(pageState) || 1), pageCount)

  useEffect(() => {
    if (safePage !== pageState) setPageState(safePage)
  }, [safePage, pageState, setPageState])

  const rows = useMemo(() => {
    if (isServerPaginated) return sortedRows
    const start = (safePage - 1) * safePageSize
    return sortedRows.slice(start, start + safePageSize)
  }, [sortedRows, isServerPaginated, safePage, safePageSize])

  const toggleSort = useCallback(
    (columnId: string) => {
      setSortState((prev) => {
        if (!prev || prev.columnId !== columnId) return { columnId, direction: 'asc' }
        if (prev.direction === 'asc') return { columnId, direction: 'desc' }
        return null
      })
      setPageState(1)
    },
    [setSortState, setPageState],
  )

  return {
    rows,
    sort: activeSort,
    toggleSort,
    page: safePage,
    pageSize: safePageSize,
    pageCount,
    total,
    rowOffset: total === 0 ? 0 : (safePage - 1) * safePageSize + 1,
    setPage: setPageState,
    setPageSize: setPageSizeState,
    isServerPaginated,
  }
}
