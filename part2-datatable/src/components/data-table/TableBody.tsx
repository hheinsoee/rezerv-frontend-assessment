import { Fragment, type ReactNode } from 'react'
import { ChevronRight, Inbox, RefreshCw, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button, Skeleton } from '../ui/primitives'
import { EXPANDER_ID, cellClasses, cellStyle } from './cells'
import { ExpandedRow } from './ExpandedRow'
import type { ColumnDef, ExpandableOptions } from './types'
import { getCellValue } from './useDataTable'
import type { useExpansion } from './useExpansion'

interface TableBodyProps<TRow, TChild> {
  rows: TRow[]
  columns: ColumnDef<TRow, any>[]
  lastPinnedId: string | null
  getRowId: (row: TRow) => string
  expandable?: ExpandableOptions<TRow, TChild>
  expansion: ReturnType<typeof useExpansion<TRow, TChild>>
  loading: boolean
  error: Error | null
  skeletonRows: number
  emptyState?: ReactNode
  onRetry?: () => void
}

export function TableBody<TRow, TChild>({
  rows,
  columns,
  lastPinnedId,
  getRowId,
  expandable,
  expansion,
  loading,
  error,
  skeletonRows,
  emptyState,
  onRetry,
}: TableBodyProps<TRow, TChild>) {
  const showSkeleton = loading && rows.length === 0
  const showError = !loading && error !== null
  const showEmpty = !loading && !showError && rows.length === 0

  if (showError) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="border-t border-slate-100 px-4 py-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <TriangleAlert className="size-8 text-rose-500" />
              <div>
                <p className="font-medium text-slate-900">Could not load data</p>
                <p className="mt-1 text-sm text-slate-500">{error.message}</p>
              </div>
              {onRetry ? (
                <Button variant="primary" onClick={onRetry}>
                  <RefreshCw className="size-4" />
                  Try again
                </Button>
              ) : null}
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  if (showSkeleton) {
    return (
      <tbody>
        {Array.from({ length: skeletonRows }, (_, rowIndex) => (
          <tr key={`skeleton-${rowIndex}`} className="group/row">
            {columns.map((column, columnIndex) => (
              <td
                key={column.id}
                className={cellClasses(column, 'cell', lastPinnedId)}
                style={cellStyle(column)}
              >
                <Skeleton
                  className={
                    column.id === EXPANDER_ID
                      ? 'size-4'
                      : columnIndex % 3 === 0
                        ? 'w-32'
                        : columnIndex % 3 === 1
                          ? 'w-24'
                          : 'w-16'
                  }
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  if (showEmpty) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="border-t border-slate-100 px-4 py-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <Inbox className="size-8 text-slate-300" />
              {emptyState ?? <p className="text-sm text-slate-500">No rows to show</p>}
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody>
      {rows.map((row, rowIndex) => {
        const rowId = getRowId(row)
        const canExpand = expandable ? (expandable.isExpandable?.(row) ?? true) : false
        const open = canExpand && expansion.isExpanded(rowId)
        const entry = expandable ? expansion.entryFor(rowId, row) : null
        const panelId = `${rowId}-expanded`

        return (
          <Fragment key={rowId}>
            <tr className="group/row">
              {columns.map((column) => {
                if (column.id === EXPANDER_ID) {
                  return (
                    <td
                      key={column.id}
                      className={cellClasses(column, 'cell', lastPinnedId)}
                      style={cellStyle(column)}
                    >
                      {canExpand ? (
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={open ? panelId : undefined}
                          aria-label={open ? 'Collapse row' : 'Expand row'}
                          onClick={() => expansion.toggle(rowId, row)}
                          className="inline-flex size-6 items-center justify-center text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none motion-reduce:transition-none"
                        >
                          <ChevronRight
                            className={cn(
                              'size-4 transition-transform duration-200 motion-reduce:transition-none',
                              open && 'rotate-90',
                            )}
                          />
                        </button>
                      ) : null}
                    </td>
                  )
                }

                const value = getCellValue(row, column)
                const content = column.cell
                  ? column.cell({ row, value, rowIndex, columnId: column.id })
                  : value === null || value === undefined || value === ''
                    ? <span className="text-slate-300">—</span>
                    : String(value)

                return (
                  <td
                    key={column.id}
                    className={cellClasses(column, 'cell', lastPinnedId)}
                    style={cellStyle(column)}
                  >
                    {content}
                  </td>
                )
              })}
            </tr>

            {expandable && entry ? (
              <ExpandedRow key={panelId} open={open} colSpan={columns.length} id={panelId}>
                {expandable.renderExpanded({
                  row,
                  status: entry.status,
                  children: entry.rows,
                  error: entry.error,
                  retry: () => expansion.retry(rowId, row),
                })}
              </ExpandedRow>
            ) : null}
          </Fragment>
        )
      })}
    </tbody>
  )
}
