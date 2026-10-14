import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

let active: Lenis | null = null

export const SLIDE_SECONDS = 1.45

export function scrollToY(y: number, onComplete?: () => void, duration = SLIDE_SECONDS) {
  if (active) {
    active.scrollTo(y, {
      duration,

      lock: true,

      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      onComplete,
    })
    return
  }
  window.scrollTo({ top: y, behavior: 'smooth' })
  onComplete?.()
}

export function useSmoothScroll(enabled: boolean, locked: boolean) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({

      smoothWheel: false,
      syncTouch: false,
    })
    lenisRef.current = lenis
    active = lenis

    const raf = (time: number) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)

    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      lenisRef.current = null
      active = null
    }
  }, [enabled])

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', locked)
    if (locked) {
      lenisRef.current?.stop()
      window.scrollTo(0, 0)
    } else {
      lenisRef.current?.start()
    }
  }, [locked])

  useEffect(() => () => document.documentElement.classList.remove('is-locked'), [])
}
