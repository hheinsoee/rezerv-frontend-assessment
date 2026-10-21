import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { SCENES } from '../../lib/scenes'
import { POSES } from '../../lib/poses'
import { Athlete } from '../Athlete'
import type { AthleteHandle } from '../Athlete'
import { FloatingLayer } from './FloatingLayer'
import type { FloatingHandle } from './FloatingLayer'
import { COPY, LABELS, PLACEMENT } from './copy'
import { useStagePaint } from './useStagePaint'
import { ArrowDown } from 'lucide-react'

const LAYOUTS = SCENES.map((scene) => scene.layout)

export function StorySlider({ revealed }: { revealed: Boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const athleteRef = useRef<AthleteHandle>(null)
  const floatingRef = useRef<FloatingHandle>(null)

  useStagePaint(rootRef, athleteRef, floatingRef)

  useLayoutEffect(() => {
    if (!revealed) return

    const ctx = gsap.context((self) => {
      const q = self.selector!
      const [first, ...rest] = q('[data-scene]')

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(first.querySelectorAll('[data-line] > span'), {
          yPercent: 115,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
        })
        .from(first.querySelectorAll('[data-in]'), { opacity: 0, y: 26, duration: 0.7, stagger: 0.07 }, 0.25)
        .from(q('[data-cue]'), { opacity: 0, y: 16, duration: 0.5 }, 0.5)

      for (const scene of rest) {
        const trigger = { trigger: scene, start: 'top 62%' }
        gsap.from(scene.querySelectorAll('[data-in]'), {
          y: 34,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: trigger,
        })
        gsap.from(scene.querySelectorAll('[data-line] > span'), {
          yPercent: 115,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: trigger,
        })
      }
    }, rootRef)

    return () => ctx.revert()
  }, [revealed])

  return (
    <div ref={rootRef} className="relative">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {SCENES.map((scene) => (
          <div
            key={scene.id}
            data-backdrop
            className={`absolute inset-0 opacity-0 ${scene.backdrop}`}
            aria-hidden="true"
          />
        ))}

        <Clouds />

        <div className="absolute inset-0 grid place-items-center">
          <div
            data-camera
            className="relative aspect-square w-[min(86vh,40rem)] max-w-[88vw] will-change-transform"
          >
            <Athlete
              ref={athleteRef}
              pose={POSES.meditate}
              className="size-full"
              label="A studio member moving through the day's classes"
            />
          </div>
        </div>

        <FloatingLayer ref={floatingRef} layouts={LAYOUTS} />
        <Totals />
      </div>

      <div data-scenes className="relative -mt-[100dvh]">
        {SCENES.map((scene) => (
          <section
            key={scene.id}
            data-scene
            data-snap
            className={`flex h-dvh px-5 sm:px-8 ${PLACEMENT[scene.id]}`}
            aria-label={LABELS[scene.id]}
          >
            {COPY[scene.id]}
          </section>
        ))}
      </div>

      <div
        data-cue
        className="pointer-events-none absolute top-[calc(100dvh-5.5rem)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.22em] text-ink/45 uppercase"
      >
        scroll
        <ArrowDown aria-hidden className="size-4 animate-bounce" />
      </div>
    </div>
  )
}

function Totals() {
  return (
    <div
      data-totals
      className="absolute top-20 right-6 text-right sm:top-24 sm:right-10 md:right-20"
      aria-hidden="true"
    >
      <p className="text-[0.62rem] font-semibold tracking-[0.2em] uppercase opacity-50">
        Today so far
      </p>
      <p className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">
        <span data-count-bookings>3</span>
        <span className="ml-1.5 text-xs font-semibold opacity-55">bookings</span>
      </p>
      <p className="font-display text-base font-extrabold tabular-nums opacity-70 sm:text-lg">
        <span data-count-revenue>$0</span>
        <span className="ml-1.5 text-xs font-semibold opacity-70">taken</span>
      </p>
    </div>
  )
}

function Clouds() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[12%] left-[8%] size-[22vw] rounded-full bg-blue/15 blur-3xl" />
      <div className="absolute top-[46%] right-[10%] size-[26vw] rounded-full bg-green/15 blur-3xl" />
      <div className="absolute bottom-[8%] left-[38%] size-[20vw] rounded-full bg-sun/20 blur-3xl" />
    </div>
  )
}
