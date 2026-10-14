import type { PoseName } from './poses'

export type Layout = 'hidden' | 'scatter' | 'driftLeft' | 'arc' | 'orbit'

export interface Camera {
  x: number
  y: number
  scale: number
  rotate: number
  opacity: number
}

export interface Scene {
  id: string

  time: string
  layout: Layout
  pose: PoseName
  camera: Camera

  cameraSm: Camera
  backdrop: string

  dark?: boolean

  bookings: number
  revenue: number
}

export const SCENES: Scene[] = [
  {
    id: 'open',
    time: '06:00',
    layout: 'scatter',
    pose: 'meditate',

    camera: { x: 28, y: -4, scale: 1, rotate: 0, opacity: 1 },
    cameraSm: { x: 0, y: -46, scale: 0.6, rotate: 0, opacity: 1 },
    backdrop: 'bg-[#FBF4E8]',
    bookings: 3,
    revenue: 0,
  },
  {
    id: 'flow',
    time: '09:30',
    layout: 'driftLeft',
    pose: 'lift',
    camera: { x: 30, y: 2, scale: 1, rotate: 0, opacity: 1 },
    cameraSm: { x: 0, y: -34, scale: 0.68, rotate: 0, opacity: 1 },
    backdrop: 'bg-chalk',
    bookings: 41,
    revenue: 980,
  },
  {
    id: 'hiit',
    time: '12:15',
    layout: 'arc',
    pose: 'pushUp',

    camera: { x: 12, y: 4, scale: 1.25, rotate: 0, opacity: 1 },
    cameraSm: { x: 2, y: -8, scale: 1, rotate: 0, opacity: 1 },
    backdrop: 'bg-[#FDF3E3]',
    bookings: 96,
    revenue: 2640,
  },
  {
    id: 'peak',
    time: '17:45',
    layout: 'scatter',
    pose: 'walk',
    camera: { x: 28, y: 4, scale: 1, rotate: 0, opacity: 1 },
    cameraSm: { x: 0, y: -34, scale: 0.72, rotate: 0, opacity: 1 },
    backdrop: 'bg-[#EEF1F4]',
    bookings: 237,
    revenue: 5310,
  },
  {
    id: 'close',
    time: '20:00',
    layout: 'orbit',
    pose: 'finish',

    camera: { x: 0, y: 22, scale: 0.7, rotate: 0, opacity: 0 },
    cameraSm: { x: 0, y: 22, scale: 0.7, rotate: 0, opacity: 0 },
    backdrop: 'bg-ink',
    dark: true,
    bookings: 312,
    revenue: 6820,
  },
]
