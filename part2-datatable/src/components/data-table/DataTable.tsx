import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { EXPANDER_ID, EXPANDER_WIDTH, cssVarId } from './cells'
import { TableBody } from './TableBody'
import { TableHead } from './TableHead'
import { TablePagination } from './TablePagination'
import type { ColumnDef, DataTableState, ExpandableOptions } from './types'
import { useDataTable, type UseDataTableOptions } from './useDataTable'
import { useExpansion } from './useExpansion'

export interface DataTableProps<TRow, TChild = unknown> extends UseDataTableOptions<TRow> {

  getRowId: (row: TRow) => string
  expandable?: ExpandableOptions<TRow, TChild>
  state?: DataTableState

  skeletonRows?: number
  emptyState?: ReactNode
  onRetry?: () => void

  caption: string
  pageSizeOptions?: number[]
  className?: string
}

export function DataTable<TRow, TChild = unknown>({
  getRowId,
  expandable,
  state,
  skeletonRows = 6,
  emptyState,
  onRetry,
  caption,
  pageSizeOptions = [5, 10, 25, 50],
  className,
  ...tableOptions
}: DataTableProps<TRow, TChild>) {
  const { columns } = tableOptions
  const model = useDataTable(tableOptions)
  const expansion = useExpansion<TRow, TChild>(expandable)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  const loading = state?.loading ?? false
  const error = state?.error ?? null

  const leafColumns = useMemo<ColumnDef<TRow, any>[]>(() => {
    if (!expandable) return columns
    const expander: ColumnDef<TRow, any> = {
      id: EXPANDER_ID,
      header: 'Expand',
      headerSrOnly: true,
      width: EXPANDER_WIDTH,
      pinned: 'left',
    }
    return [expander, ...columns]
  }, [columns, expandable])

  // Measure the real column widths and store them as CSS variables.
  // The sticky columns use them as left offsets.
  const pinnedIds = useMemo(
    () => leafColumns.filter((column) => column.pinned === 'left').map((column) => column.id),
    [leafColumns],
  )
  const lastPinnedId = pinnedIds.at(-1) ?? null

  useLayoutEffect(() => {
    const table = tableRef.current
    const scroller = scrollRef.current
    if (!table || !scroller || pinnedIds.length === 0) return

    const measure = () => {
      let offset = 0
      for (const id of pinnedIds) {
        table.style.setProperty(`--pin-${cssVarId(id)}`, `${offset}px`)
        const header = table.querySelector<HTMLTableCellElement>(`thead th[data-col-id="${id}"]`)
        offset += header?.getBoundingClientRect().width ?? 0
      }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [pinnedIds])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const sync = () => {
      const scrolled = node.scrollLeft > 0 ? 'true' : 'false'
      if (node.dataset.scrolled !== scrolled) node.dataset.scrolled = scrolled
    }

    sync()
    node.addEventListener('scroll', sync, { passive: true })
    return () => node.removeEventListener('scroll', sync)
  }, [])

  const showError = !loading && error !== null
  const [filter, setFilter] = useState<string | undefined>();
  return (
    <div
      className={cn(
        'overflow-hidden border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      filter value{filter}
      <div
        ref={scrollRef}
        className="group/scroll overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={caption}
      >
        <table ref={tableRef} className="w-full border-separate border-spacing-0">
          <caption className="sr-only">{caption}</caption>
          <colgroup>
            {leafColumns.map((column) => (
              <col
                key={column.id}
                style={{
                  width: column.width,
                  minWidth: column.minWidth ?? column.width,
                }}
              />
            ))}
          </colgroup>

          <TableHead
            columns={leafColumns}
            lastPinnedId={lastPinnedId}
            sort={model.sort}
            onToggleSort={model.toggleSort}
            data={tableOptions.data}
            filterValue={filter}
            onFilterChange={setFilter}

          />

          <TableBody
            rows={model.rows}
            columns={leafColumns}
            lastPinnedId={lastPinnedId}
            getRowId={getRowId}
            expandable={expandable}
            expansion={expansion}
            loading={loading}
            error={error}
            skeletonRows={skeletonRows}
            emptyState={emptyState}
            onRetry={onRetry}
          />
        </table>
      </div>

      <TablePagination
        page={model.page}
        pageCount={model.pageCount}
        pageSize={model.pageSize}
        pageSizeOptions={pageSizeOptions}
        total={model.total}
        rowOffset={model.rowOffset}
        rowsOnPage={model.rows.length}
        disabled={loading || showError}
        onPageChange={model.setPage}
        onPageSizeChange={model.setPageSize}
      />
    </div>
  )
}
