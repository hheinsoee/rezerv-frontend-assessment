import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  columnId: string
  direction: SortDirection
}

export type ColumnAlign = 'left' | 'center' | 'right'

export interface CellContext<TRow, TValue> {
  row: TRow
  value: TValue
  rowIndex: number
  columnId: string
}

export interface ColumnDef<TRow, TValue = unknown> {
  id: string
  header: ReactNode

  accessor?: keyof TRow | ((row: TRow) => TValue)
  cell?: (ctx: CellContext<TRow, TValue>) => ReactNode
  sortable?: boolean

  sortFn?: (a: TRow, b: TRow) => number

  width?: number | string
  minWidth?: number | string
  pinned?: 'left'
  align?: ColumnAlign
  headerSrOnly?: boolean
}

export type ChildStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ExpandedContext<TRow, TChild> {
  row: TRow
  status: ChildStatus
  children: TChild[]
  error: Error | null

  retry: () => void
}

export interface ExpandableOptions<TRow, TChild> {

  getChildren?: (row: TRow) => TChild[] | undefined

  loadChildren?: (row: TRow) => Promise<TChild[]>
  renderExpanded: (ctx: ExpandedContext<TRow, TChild>) => ReactNode

  isExpandable?: (row: TRow) => boolean
}

export interface DataTableState {
  loading?: boolean
  error?: Error | null
}
