import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { gsap } from '../../lib/gsap'
import { SCENES } from '../../lib/scenes'
import { MOTIONS, POSES } from '../../lib/poses'
import { lerpPose } from '../../lib/rig'
import type { AthleteHandle } from '../Athlete'
import type { FloatingHandle } from './FloatingLayer'

const POSE_LIST = SCENES.map((scene) => POSES[scene.pose])
const MOTION_LIST = SCENES.map((scene) => MOTIONS[scene.pose])
const LAST = SCENES.length - 1

function hold(f: number): number {
  const x = Math.min(Math.max((f - 0.2) / 0.6, 0), 1)
  return x * x * (3 - 2 * x)
}

const mix = (from: number, to: number, t: number) => from + (to - from) * t

// One loop paints pose, camera, backdrop and totals from the scroll position.
// React does not re-render while this runs.
export function useStagePaint(
  rootRef: RefObject<HTMLDivElement | null>,
  athleteRef: RefObject<AthleteHandle | null>,
  floatingRef: RefObject<FloatingHandle | null>,
) {
  const progress = useRef(0)

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      const q = self.selector!
      const camera = q('[data-camera]')[0]
      const backdrops = q('[data-backdrop]') as HTMLElement[]
      const totals = q('[data-totals]')[0]
      const bookingsEl = q('[data-count-bookings]')[0]
      const revenueEl = q('[data-count-revenue]')[0]
      let night = false

      const mm = gsap.matchMedia()
      let cameras = SCENES.map((scene) => scene.camera)
      mm.add('(min-width: 64rem)', () => {
        cameras = SCENES.map((scene) => scene.camera)
      })
      mm.add('(max-width: 63.999rem)', () => {
        cameras = SCENES.map((scene) => scene.cameraSm)
      })

      const paint = (position: number, time: number) => {
        const index = Math.min(Math.max(Math.floor(position), 0), LAST - 1)
        const blend = hold(position - index)
        const a = SCENES[index]
        const b = SCENES[index + 1]

        const barAlpha =
          (a.pose === 'lift' ? 1 - blend : 0) + (b.pose === 'lift' ? blend : 0)
        athleteRef.current?.apply(
          lerpPose(
            MOTION_LIST[index](POSE_LIST[index], time),
            MOTION_LIST[index + 1](POSE_LIST[index + 1], time),
            blend,
          ),
          barAlpha,
        )
        floatingRef.current?.render(position, time)

        const camA = cameras[index]
        const camB = cameras[index + 1]
        gsap.set(camera, {
          xPercent: mix(camA.x, camB.x, blend),
          yPercent: mix(camA.y, camB.y, blend),
          scale: mix(camA.scale, camB.scale, blend),
          rotate: mix(camA.rotate, camB.rotate, blend),
          opacity: mix(camA.opacity, camB.opacity, blend),
        })

        backdrops.forEach((backdrop, i) => {
          gsap.set(backdrop, { opacity: Math.max(0, 1 - Math.abs(position - i)) })
        })

        bookingsEl.textContent = String(Math.round(mix(a.bookings, b.bookings, blend)))
        revenueEl.textContent = `$${Math.round(mix(a.revenue, b.revenue, blend)).toLocaleString('en-GB')}`
        gsap.set(totals, {
          color: gsap.utils.interpolate(
            '#040f0f',
            '#ffffff',
            Math.min(1, Math.max(0, position - (LAST - 1))),
          ),
        })

        const isNight = position > LAST - 0.45
        if (isNight !== night) {
          night = isNight
          document.documentElement.toggleAttribute('data-night', isNight)
        }
      }

      const start = performance.now()
      const tick = () => paint(progress.current * LAST, (performance.now() - start) / 1000)

      const trigger = gsap.timeline({
        scrollTrigger: {
          trigger: q('[data-scenes]')[0],
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (st) => {
            progress.current = st.progress
          },
          onRefresh: (st) => {
            progress.current = st.progress
          },
        },
      })

      gsap.ticker.add(tick)
      tick()

      return () => {
        gsap.ticker.remove(tick)
        trigger.scrollTrigger?.kill()
        mm.revert()
        document.documentElement.removeAttribute('data-night')
      }
    }, rootRef)

    return () => ctx.revert()
  }, [rootRef, athleteRef, floatingRef])
}
