import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { PROPS, PROP_SIZE } from '../lib/props'
import { Wordmark } from './ui/Wordmark'

const FLOATERS = [PROPS.dumbbell, PROPS.bottle, PROPS.stopwatch, PROPS.kettlebell]

const MIN_VISIBLE_MS = 900

interface PreloaderProps {

  sources: string[]
  reduced: boolean

  onReveal: () => void

  onDone: () => void
}

export function Preloader({ sources, reduced, onReveal, onDone }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const startedAt = performance.now()

    let waitingOn = sources.length + 1
    let timer = 0

    const exit = () => {
      onReveal()
      gsap.to(rootRef.current, {
        autoAlpha: 0,
        duration: reduced ? 0.2 : 0.6,
        ease: 'power2.inOut',
        onComplete: onDone,
      })
    }

    const settled = () => {
      waitingOn -= 1
      if (waitingOn > 0) return
      timer = window.setTimeout(exit, Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt)))
    }

    const images = sources.map((src) => {
      const img = new Image()
      img.onload = settled
      img.onerror = settled
      img.src = src
      return img
    })
    document.fonts.ready.then(settled, settled)

    return () => {
      window.clearTimeout(timer)
      for (const img of images) {
        img.onload = null
        img.onerror = null
      }
    }
  }, [sources, reduced, onReveal, onDone])

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.to('[data-float]', {
        y: -18,
        rotate: 8,
        duration: 1.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.25,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[var(--z-preloader)] grid place-items-center bg-ink text-paper"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-6 sm:gap-10">
          {FLOATERS.map((src) => (
            <img
              key={src}
              data-float
              src={src}
              width={PROP_SIZE}
              height={PROP_SIZE}
              alt=""
              className="size-12 sm:size-16"
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Wordmark className="text-xl sm:text-2xl" />
          <p className="text-sm tracking-[0.18em] text-paper/55 lowercase">loading…</p>
        </div>
      </div>
    </div>
  )
}
