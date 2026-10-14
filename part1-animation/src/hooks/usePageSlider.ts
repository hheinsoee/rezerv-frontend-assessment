import { useEffect, useState } from 'react'
import { SLIDE_SECONDS, scrollToY } from './useSmoothScroll'

const QUIET_MS = 300

const STUCK_MS = SLIDE_SECONDS * 1000 + 600

const WHEEL_THRESHOLD = 12
const SWIPE_THRESHOLD = 48
const KEYS_NEXT = ['ArrowDown', 'PageDown', 'ArrowRight', ' ']
const KEYS_PREV = ['ArrowUp', 'PageUp', 'ArrowLeft']

export interface PageSlider {
  index: number
  goTo: (index: number) => void
}

// One wheel or swipe gesture moves exactly one page.
export function usePageSlider(enabled: boolean, count: number): PageSlider {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return

    let current = Math.round(window.scrollY / window.innerHeight)
    let busy = false
    let quiet = 0
    let stuck = 0

    const release = () => {
      window.clearTimeout(quiet)
      window.clearTimeout(stuck)
      busy = false
      const seen = Math.round(window.scrollY / window.innerHeight)
      if (seen !== current) {
        current = seen
        setIndex(seen)
      }
    }

    const go = (next: number) => {
      const target = Math.min(Math.max(next, 0), count - 1)
      if (target === current && !busy) return
      current = target
      setIndex(target)
      busy = true

      window.clearTimeout(stuck)
      stuck = window.setTimeout(release, STUCK_MS)

      scrollToY(target * window.innerHeight, () => {

        window.clearTimeout(quiet)
        quiet = window.setTimeout(release, QUIET_MS)
      })
    }

    const onVisibility = () => {
      if (busy) release()
    }

    const onWheel = (event: WheelEvent) => {

      const target = event.target
      if (target instanceof Element && target.closest('[data-allow-scroll]')) return
      event.preventDefault()
      if (busy || Math.abs(event.deltaY) < WHEEL_THRESHOLD) return
      go(current + (event.deltaY > 0 ? 1 : -1))
    }

    let touchStart = 0
    const onTouchStart = (event: TouchEvent) => {
      touchStart = event.touches[0].clientY
    }
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      if (busy) return
      const delta = touchStart - event.touches[0].clientY
      if (Math.abs(delta) < SWIPE_THRESHOLD) return
      go(current + (delta > 0 ? 1 : -1))
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (KEYS_NEXT.includes(event.key)) {
        event.preventDefault()
        go(current + 1)
      } else if (KEYS_PREV.includes(event.key)) {
        event.preventDefault()
        go(current - 1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        go(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        go(count - 1)
      }
    }

    const onScroll = () => {
      if (busy) return
      const seen = Math.round(window.scrollY / window.innerHeight)
      if (seen !== current) {
        current = seen
        setIndex(seen)
      }
    }

    const onResize = () => go(current)

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.clearTimeout(quiet)
      window.clearTimeout(stuck)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [enabled, count])

  return {
    index,
    goTo: (next: number) => scrollToY(next * window.innerHeight),
  }
}
