import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ChildStatus, ExpandableOptions } from './types'

interface ChildEntry<TChild> {
  status: ChildStatus
  rows: TChild[]
  error: Error | null
}

export interface ExpansionModel<TRow, TChild> {
  isExpanded: (rowId: string) => boolean
  toggle: (rowId: string, row: TRow) => void
  retry: (rowId: string, row: TRow) => void
  entryFor: (rowId: string, row: TRow) => ChildEntry<TChild>
}

const INLINE_EMPTY: ChildEntry<never> = { status: 'ready', rows: [], error: null }

// Children load once per row and are cached. Late answers from old requests are ignored.
export function useExpansion<TRow, TChild>(
  options: ExpandableOptions<TRow, TChild> | undefined,
): ExpansionModel<TRow, TChild> {
  const [expanded, setExpanded] = useState<Record<string, true>>({})
  const [children, setChildren] = useState<Record<string, ChildEntry<TChild>>>({})
  const tokens = useRef<Record<string, number>>({})

  const optionsRef = useRef(options)
  useLayoutEffect(() => {
    optionsRef.current = options
  })

  const load = useCallback((rowId: string, row: TRow) => {
    const loadChildren = optionsRef.current?.loadChildren
    if (!loadChildren) return

    const token = (tokens.current[rowId] ?? 0) + 1
    tokens.current[rowId] = token

    setChildren((prev) => ({
      ...prev,
      [rowId]: { status: 'loading', rows: prev[rowId]?.rows ?? [], error: null },
    }))

    loadChildren(row).then(
      (rows) => {
        if (tokens.current[rowId] !== token) return
        setChildren((prev) => ({ ...prev, [rowId]: { status: 'ready', rows, error: null } }))
      },
      (cause: unknown) => {
        if (tokens.current[rowId] !== token) return
        const error = cause instanceof Error ? cause : new Error('Failed to load rows')
        setChildren((prev) => ({ ...prev, [rowId]: { status: 'error', rows: [], error } }))
      },
    )
  }, [])

  const toggle = useCallback(
    (rowId: string, row: TRow) => {
      setExpanded((prev) => {
        if (prev[rowId]) {
          const { [rowId]: _removed, ...rest } = prev
          return rest
        }
        return { ...prev, [rowId]: true }
      })

      const alreadyOpen = Boolean(expanded[rowId])
      const entry = children[rowId]
      const needsFetch = !entry || entry.status === 'error'
      if (!alreadyOpen && needsFetch) load(rowId, row)
    },
    [expanded, children, load],
  )

  const retry = useCallback((rowId: string, row: TRow) => load(rowId, row), [load])

  const entryFor = useCallback(
    (rowId: string, row: TRow): ChildEntry<TChild> => {
      const getChildren = optionsRef.current?.getChildren
      if (getChildren) {
        const rows = getChildren(row)
        return rows ? { status: 'ready', rows, error: null } : (INLINE_EMPTY as ChildEntry<TChild>)
      }
      return children[rowId] ?? { status: 'idle', rows: [], error: null }
    },
    [children],
  )

  const isExpanded = useCallback((rowId: string) => Boolean(expanded[rowId]), [expanded])

  return { isExpanded, toggle, retry, entryFor }
}
