import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

const DURATION_MS = 280

export function ExpandedRow({
  open,
  colSpan,
  id,
  children,
}: {
  open: boolean
  colSpan: number
  id: string
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(open)
  const boxRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  if (open && !mounted) setMounted(true)

  useLayoutEffect(() => {
    const box = boxRef.current
    const content = box?.firstElementChild
    if (!box || !(content instanceof HTMLElement)) return

    window.clearTimeout(timer.current)

    if (open) {
      box.style.height = '0px'
      void box.offsetHeight
      box.style.height = `${content.offsetHeight}px`
      timer.current = window.setTimeout(() => {
        box.style.height = 'auto'
      }, DURATION_MS)
      return
    }

    box.style.height = `${content.offsetHeight}px`
    void box.offsetHeight
    box.style.height = '0px'
    timer.current = window.setTimeout(() => setMounted(false), DURATION_MS)
  }, [open, mounted])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!mounted) return null

  return (
    <tr className="bg-slate-50/70">
      <td colSpan={colSpan} className="p-0">
        <div
          id={id}
          ref={boxRef}
          className="h-0 overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
        >
          <div>{children}</div>
        </div>
      </td>
    </tr>
  )
}
