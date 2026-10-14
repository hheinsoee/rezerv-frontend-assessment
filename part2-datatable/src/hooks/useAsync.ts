import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncState<TValue> {
  data: TValue | null
  loading: boolean
  error: Error | null
  reload: () => void
}

export function useAsync<TValue>(run: () => Promise<TValue>, deps: unknown[]): AsyncState<TValue> {
  const [data, setData] = useState<TValue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [nonce, setNonce] = useState(0)

  const token = useRef(0)
  const runRef = useRef(run)
  runRef.current = run

  useEffect(() => {
    const current = ++token.current
    setLoading(true)
    setError(null)

    runRef.current().then(
      (value) => {
        if (token.current !== current) return
        setData(value)
        setLoading(false)
      },
      (cause: unknown) => {
        if (token.current !== current) return
        setError(cause instanceof Error ? cause : new Error('Request failed'))
        setData(null)
        setLoading(false)
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return { data, loading, error, reload }
}
