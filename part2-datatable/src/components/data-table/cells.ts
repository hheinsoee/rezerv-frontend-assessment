import { cn } from '../../lib/cn'
import type { ColumnAlign, ColumnDef } from './types'

export const EXPANDER_ID = '__expander'
export const EXPANDER_WIDTH = 48

const ALIGNMENT: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function cssVarId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function cellClasses<TRow>(
  column: ColumnDef<TRow, any>,
  kind: 'header' | 'cell',
  lastPinnedId: string | null,
) {
  const isPinned = column.pinned === 'left'
  return cn(
    'px-4 py-3 text-sm whitespace-nowrap',
    ALIGNMENT[column.align ?? 'left'],
    kind === 'header'
      ? 'bg-slate-50 font-medium text-slate-600'
      : 'bg-white text-slate-700 group-hover/row:bg-slate-50',
    kind === 'cell' && 'border-t border-slate-100',
    'transition-colors motion-reduce:transition-none',
    isPinned && 'sticky',
    isPinned && (kind === 'header' ? 'z-30' : 'z-20'),

    column.id === lastPinnedId &&
      'after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-4 after:translate-x-full after:bg-linear-to-r after:from-slate-900/12 after:to-transparent after:opacity-0 after:transition-opacity group-data-[scrolled=true]/scroll:after:opacity-100 motion-reduce:after:transition-none',
  )
}

export function cellStyle<TRow>(column: ColumnDef<TRow, any>) {
  return column.pinned === 'left'
    ? { left: `var(--pin-${cssVarId(column.id)}, 0px)` }
    : undefined
}
