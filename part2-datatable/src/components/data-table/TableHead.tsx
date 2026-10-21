import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { cellClasses, cellStyle } from './cells'
import type { ColumnDef, SortState } from './types'
import { TableColumnFilter } from './TableColumnFilter'
import { getCellValue } from './useDataTable'
interface TableHeadProps<TRow> {
  data: TRow[]
  columns: ColumnDef<TRow, any>[]
  lastPinnedId: string | null
  sort: SortState | null
  onToggleSort: (columnId: string) => void
  filterValue?: string
  onFilterChange?: (filterValue: string) => void
}

export function TableHead<TRow>({
  columns,
  lastPinnedId,
  sort,
  onToggleSort,
  data,
  filterValue,
  onFilterChange
}: TableHeadProps<TRow>) {

  return (
    <thead>
      <tr>
        {columns.map((column) => {
          const isSorted = sort?.columnId === column.id
          const direction = isSorted ? sort?.direction : undefined
          const options: string[] = data.map((row: TRow) => String(getCellValue(row, column)));
          return (
            <th
              key={column.id}
              data-col-id={column.id}
              scope="col"
              aria-sort={
                !column.sortable
                  ? undefined
                  : direction === 'asc'
                    ? 'ascending'
                    : direction === 'desc'
                      ? 'descending'
                      : 'none'
              }
              className={cn(cellClasses(column, 'header', lastPinnedId), 'border-b border-slate-200')}
              style={cellStyle(column)}
            >
              <div className='flex gap-1 items-center'>
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onToggleSort(column.id)}
                    className={cn(
                      'group/sort -mx-1 inline-flex items-center gap-1.5 px-1 py-0.5',
                      'transition-colors hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none motion-reduce:transition-none',
                      isSorted && 'text-slate-900',
                    )}
                  >
                    <span className={column.headerSrOnly ? 'sr-only' : undefined}>
                      {column.header}
                    </span>
                    {direction === 'asc' ? (
                      <ArrowUp className="size-3.5 shrink-0 text-slate-600" />
                    ) : direction === 'desc' ? (
                      <ArrowDown className="size-3.5 shrink-0 text-slate-600" />
                    ) : (
                      <ChevronsUpDown className="size-3.5 shrink-0 text-slate-300 group-hover/sort:text-slate-500" />
                    )}
                  </button>
                ) : (
                  <span className={column.headerSrOnly ? 'sr-only' : undefined}>
                    {column.header}
                  </span>
                )}
                {onFilterChange && <TableColumnFilter
                  value={filterValue}
                  options={options}
                  onSelect={onFilterChange} />}
              </div>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
