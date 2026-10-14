import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export interface ControllableStateOptions<T> {

  value: T | undefined
  defaultValue: T
  onChange?: (next: T) => void
}

type Updater<T> = T | ((prev: T) => T)

// If the parent passes a value, the parent owns the state. If not, we keep it here.
// This is how the same table works in client mode and server mode.
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>): [T, (next: Updater<T>) => void] {
  const [internal, setInternal] = useState(defaultValue)

  const isControlled = value !== undefined
  const resolved = isControlled ? (value as T) : internal

  const controlledRef = useRef(isControlled)
  const resolvedRef = useRef(resolved)
  const onChangeRef = useRef(onChange)

  useLayoutEffect(() => {
    controlledRef.current = isControlled
    resolvedRef.current = resolved
    onChangeRef.current = onChange
  })

  const setValue = useCallback((next: Updater<T>) => {
    const prev = resolvedRef.current
    const value = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
    if (Object.is(value, prev)) return

    if (!controlledRef.current) setInternal(value)
    onChangeRef.current?.(value)
  }, [])

  return [resolved, setValue]
}
