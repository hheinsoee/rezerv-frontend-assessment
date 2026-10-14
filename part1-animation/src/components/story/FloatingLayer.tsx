import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Layout } from '../../lib/scenes'
import { PROPS, PROP_SIZE } from '../../lib/props'
import { CalendarDays, Check, Heart, Zap } from 'lucide-react'

interface FloatObject {
  id: string
  kind: 'prop' | 'card'
  src?: string
  icon?: 'calendar' | 'check' | 'bolt' | 'heart'
  title?: string
  detail?: string

  size: number

  depth: number
}

const OBJECTS: FloatObject[] = [
  { id: 'p1', kind: 'prop', src: PROPS.dumbbell, size: 78, depth: 1.2 },
  { id: 'c1', kind: 'card', icon: 'calendar', title: 'Vinyasa Flow', detail: '7:00 · 12/15', size: 190, depth: 1 },
  { id: 'p2', kind: 'prop', src: PROPS.bottle, size: 58, depth: 0.8 },
  { id: 'c2', kind: 'card', icon: 'check', title: 'Unlimited', detail: 'Auto-renewed', size: 176, depth: 1.1 },
  { id: 'p3', kind: 'prop', src: PROPS.stopwatch, size: 64, depth: 1.3 },
  { id: 'c3', kind: 'card', icon: 'bolt', title: '$4,820', detail: 'Payout settled', size: 180, depth: 0.9 },
  { id: 'p4', kind: 'prop', src: PROPS.kettlebell, size: 70, depth: 1.1 },
  { id: 'c4', kind: 'card', icon: 'heart', title: '12-week streak', detail: '3 members', size: 186, depth: 1.2 },
  { id: 'p5', kind: 'prop', src: PROPS.dumbbell, size: 54, depth: 0.7 },
  { id: 'p6', kind: 'prop', src: PROPS.stopwatch, size: 48, depth: 0.9 },
]

const ICONS = {
  calendar: <CalendarDays className="size-4" />,
  check: <Check className="size-4" />,
  bolt: <Zap className="size-4" />,
  heart: <Heart className="size-4" />,
}

const COUNT = OBJECTS.length
const TAU = Math.PI * 2

interface Slot {
  x: number
  y: number
  rot: number
  scale: number
  alpha: number
}

function onRing(angle: number, spread: number, narrow: boolean) {
  const centreX = narrow ? 0.5 : 0.72
  const radiusX = narrow ? 0.32 : 0.2
  return {
    x: centreX + Math.cos(angle) * radiusX * spread,
    y: 0.5 + Math.sin(angle) * 0.3 * spread,
  }
}

function noise(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function scatter(i: number, narrow: boolean): Slot {
  const angle = (i / COUNT) * TAU + noise(i, 3) * 0.8
  return {
    ...onRing(angle, i % 2 === 0 ? 0.9 : 1, narrow),
    rot: (noise(i, 7) - 0.5) * 24,
    scale: 1,
    alpha: 1,
  }
}

function driftLeft(i: number, time: number): Slot {
  const lane = noise(i, 11)
  const speed = 0.028 + lane * 0.02
  const raw = noise(i, 13) + 1 - ((time * speed) % 1.4)
  return {
    x: ((raw % 1.4) + 1.4) % 1.4 - 0.2,
    y: 0.5 + (lane - 0.5) * 0.6,
    rot: Math.sin(time * 0.5 + i) * 7,
    scale: 1,
    alpha: 1,
  }
}

function arc(i: number): Slot {
  const angle = (-160 + (i / (COUNT - 1)) * 140) * (Math.PI / 180)
  return {
    x: 0.5 + Math.cos(angle) * 0.42,
    y: 0.34 + Math.sin(angle) * 0.22,
    rot: (angle * 180) / Math.PI + 90,
    scale: 0.86,
    alpha: 1,
  }
}

function orbit(i: number, time: number, narrow: boolean): Slot {
  const angle = (i / COUNT) * TAU + time * 0.17
  return {
    x: 0.5 + Math.cos(angle) * (narrow ? 0.34 : 0.4),
    y: 0.5 + Math.sin(angle) * 0.32,
    rot: Math.sin(angle) * 12,
    scale: 0.92,
    alpha: 1,
  }
}

function slotFor(layout: Layout, i: number, time: number, narrow: boolean): Slot {
  switch (layout) {
    case 'driftLeft':
      return driftLeft(i, time)
    case 'arc':
      return arc(i)
    case 'orbit':
      return orbit(i, time, narrow)
    case 'hidden':
      return { ...scatter(i, narrow), scale: 0.6, alpha: 0 }
    default:
      return scatter(i, narrow)
  }
}

export interface FloatingHandle {

  render: (position: number, time: number) => void
}

interface FloatingLayerProps {
  layouts: Layout[]
  ref?: React.Ref<FloatingHandle>
  className?: string
}

export function FloatingLayer({ layouts, ref, className = '' }: FloatingLayerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const nodes = useRef<HTMLElement[]>([])
  const box = useRef({ w: 1440, h: 900 })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    nodes.current = [...root.querySelectorAll<HTMLElement>('[data-float-obj]')]

    const measure = () => {
      const rect = root.getBoundingClientRect()
      box.current = { w: rect.width, h: rect.height }
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useImperativeHandle(ref, () => ({
    render(position, time) {
      const last = layouts.length - 1
      const index = Math.min(Math.max(Math.floor(position), 0), last - 1)
      const raw = Math.min(Math.max(position - index, 0), 1)
      const blend = raw * raw * (3 - 2 * raw)
      const from = layouts[index]
      const to = layouts[index + 1]
      const { w, h } = box.current

      const narrow = w < 768
      const shrink = w < 640 ? 0.58 : w < 1024 ? 0.78 : 1

      for (let i = 0; i < nodes.current.length; i++) {
        const a = slotFor(from, i, time, narrow)
        const b = slotFor(to, i, time, narrow)
        const x = (a.x + (b.x - a.x) * blend) * w
        const y = (a.y + (b.y - a.y) * blend) * h
        const rot = a.rot + (b.rot - a.rot) * blend
        const scale = (a.scale + (b.scale - a.scale) * blend) * shrink
        const alpha = a.alpha + (b.alpha - a.alpha) * blend

        const node = nodes.current[i]
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
        node.style.opacity = alpha.toFixed(3)
      }
    },
  }))

  return (
    <div ref={rootRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {OBJECTS.map((object) => (
        <div
          key={object.id}
          data-float-obj
          className="absolute top-0 left-0 opacity-0 will-change-transform"
          style={{ width: object.kind === 'prop' ? object.size : undefined }}
        >
          {object.kind === 'prop' ? (
            <img
              src={object.src}
              width={PROP_SIZE}
              height={PROP_SIZE}
              alt=""
              loading="eager"
              decoding="async"
              className="w-full"
            />
          ) : (
            <div
              className="flex items-center gap-2.5 rounded-pill border-[2.5px] border-contour bg-paper px-3 py-2 shadow-[0_12px_26px_-18px_rgb(4_15_15/0.6)]"
              style={{ width: object.size }}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-pill bg-green text-ink">
                {ICONS[object.icon!]}
              </span>
              <span className="min-w-0 text-[0.72rem] leading-tight font-semibold">
                {object.title}
                <span className="block truncate text-[0.66rem] font-normal text-ink/55">
                  {object.detail}
                </span>
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
