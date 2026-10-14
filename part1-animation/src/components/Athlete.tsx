import { useImperativeHandle, useLayoutEffect, useRef } from 'react'
import type { Pose, Vec } from '../lib/rig'
import { polyline, solve, step } from '../lib/rig'

const INK = '#010101'
const SKIN = '#8d5524'
const SKIN_SHADE = '#73431b'
const SHIRT = '#00c066'
const SHIRT_SHADE = '#00a357'
const SHORTS = '#29339b'
const SHORTS_SHADE = '#1f2878'
const SHOE = '#ffbe0b'
const SHOE_SHADE = '#dd9f06'

export interface AthleteHandle {

  apply: (pose: Pose, bar?: number) => void
}

interface AthleteProps {
  pose: Pose
  ref?: React.Ref<AthleteHandle>
  className?: string
  bar?: boolean

  label?: string
}

const WIDTH = { arm: 12, leg: 16, neck: 14, foot: 14, sleeve: 19, shorts: 23 }
const CONTOUR = 7
const SHOULDER_HALF = 33
const WAIST_HALF = 21

const SLEEVE_END = 0.55
const SHORTS_END = 0.62

const mid = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

export function Athlete({ pose, bar = false, ref, className, label }: AthleteProps) {
  const rootRef = useRef<SVGSVGElement>(null)
  const segments = useRef<Record<string, Element[]>>({})
  const headRef = useRef<SVGGElement>(null)

  useLayoutEffect(() => {
    const map: Record<string, Element[]> = {}
    rootRef.current?.querySelectorAll('[data-seg]').forEach((el) => {
      const key = (el as HTMLElement).dataset.seg!
      ;(map[key] ??= []).push(el)
    })
    segments.current = map
  }, [])

  const apply = (next: Pose, barAlpha = 0) => {
    const s = solve(next)
    const write = (key: string, attr: string, value: string) => {
      for (const node of segments.current[key] ?? []) node.setAttribute(attr, value)
    }

    write('armBack', 'd', polyline(s.armBack))
    write('armFront', 'd', polyline(s.armFront))
    write('legBack', 'd', polyline(s.legBack))
    write('legFront', 'd', polyline(s.legFront))
    write('neck', 'd', polyline([s.shoulder, s.neck]))
    write('footBack', 'd', polyline([s.legBack[2], s.footBack]))
    write('footFront', 'd', polyline([s.legFront[2], s.footFront]))

    write('sleeveBack', 'd', polyline([s.armBack[0], mid(s.armBack[0], s.armBack[1], SLEEVE_END)]))
    write('sleeveFront', 'd', polyline([s.armFront[0], mid(s.armFront[0], s.armFront[1], SLEEVE_END)]))
    write('shortsBack', 'd', polyline([s.legBack[0], mid(s.legBack[0], s.legBack[1], SHORTS_END)]))
    write('shortsFront', 'd', polyline([s.legFront[0], mid(s.legFront[0], s.legFront[1], SHORTS_END)]))

    const angle = (Math.atan2(s.shoulder.y - s.hip.y, s.shoulder.x - s.hip.x) * 180) / Math.PI
    const perp = angle + 90
    const sL = step(s.shoulder, perp, -SHOULDER_HALF)
    const sR = step(s.shoulder, perp, SHOULDER_HALF)
    const hL = step(s.hip, perp, -WAIST_HALF)
    const hR = step(s.hip, perp, WAIST_HALF)
    const top = step(s.shoulder, angle, 15)
    const bottom = step(s.hip, angle, -13)
    const p = (v: Vec) => `${v.x.toFixed(1)} ${v.y.toFixed(1)}`
    write(
      'torso',
      'd',
      `M${p(sL)}Q${p(top)} ${p(sR)}L${p(hR)}Q${p(bottom)} ${p(hL)}Z`,
    )

    for (const [key, point] of [
      ['handBack', s.armBack[2]],
      ['handFront', s.armFront[2]],
    ] as const) {
      write(key, 'cx', point.x.toFixed(1))
      write(key, 'cy', point.y.toFixed(1))
    }

    headRef.current?.setAttribute(
      'transform',
      `translate(${s.head.x.toFixed(1)} ${s.head.y.toFixed(1)}) rotate(${(s.headAngle + 90).toFixed(1)})`,
    )

    write('barGroup', 'opacity', barAlpha.toFixed(3))
    if (barAlpha > 0) {
      const cx = (s.armBack[2].x + s.armFront[2].x) / 2
      const cy = (s.armBack[2].y + s.armFront[2].y) / 2
      write('bar', 'd', `M${(cx - 92).toFixed(1)} ${cy.toFixed(1)}L${(cx + 92).toFixed(1)} ${cy.toFixed(1)}`)
      const plates = [
        ['plateBackOut', cx - 86],
        ['plateBackIn', cx - 70],
        ['plateFrontIn', cx + 70],
        ['plateFrontOut', cx + 86],
      ] as const
      for (const [key, x] of plates) {
        write(key, 'cx', x.toFixed(1))
        write(key, 'cy', cy.toFixed(1))
      }
    }
  }

  useImperativeHandle(ref, () => ({ apply }))

  useLayoutEffect(() => {
    apply(pose, bar ? 1 : 0)
  }, [pose, bar])

  const limb = (key: string, width: number, fill: string) => (
    <>
      <path
        data-seg={key}
        fill="none"
        stroke={INK}
        strokeWidth={width + CONTOUR}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-seg={key}
        fill="none"
        stroke={fill}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )

  const hand = (key: string) => (
    <circle data-seg={key} r="7.5" fill={SKIN} stroke={INK} strokeWidth="3" />
  )

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 400 400"
      className={className}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {limb('armBack', WIDTH.arm, SKIN_SHADE)}
      {limb('sleeveBack', WIDTH.sleeve, SHIRT_SHADE)}
      {hand('handBack')}

      <g data-seg="barGroup" opacity="0">
        <path data-seg="bar" stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle data-seg="plateBackOut" r="16" fill={SHORTS} stroke={INK} strokeWidth="3" />
        <circle data-seg="plateBackIn" r="11" fill={SHOE} stroke={INK} strokeWidth="3" />
        <circle data-seg="plateFrontIn" r="11" fill={SHOE} stroke={INK} strokeWidth="3" />
        <circle data-seg="plateFrontOut" r="16" fill={SHORTS} stroke={INK} strokeWidth="3" />
      </g>
      {limb('footBack', WIDTH.foot, SHOE_SHADE)}
      {limb('legBack', WIDTH.leg, SKIN_SHADE)}
      {limb('shortsBack', WIDTH.shorts, SHORTS_SHADE)}

      {limb('neck', WIDTH.neck, SKIN)}
      <path data-seg="torso" fill={SHIRT} stroke={INK} strokeWidth="3.4" strokeLinejoin="round" />

      {limb('footFront', WIDTH.foot, SHOE)}
      {limb('legFront', WIDTH.leg, SKIN)}
      {limb('shortsFront', WIDTH.shorts, SHORTS)}
      {limb('armFront', WIDTH.arm, SKIN)}
      {limb('sleeveFront', WIDTH.sleeve, SHIRT)}
      {hand('handFront')}

      <g ref={headRef}>
        <circle r="25" fill={SKIN} stroke={INK} strokeWidth="3" />
        <path
          fill={INK}
          d="M-24.9 4A25.2 25.2 0 1 1 24.9 4L20 6Q21-7 8-8.5L2-6.5-8-8.5Q-21-7-20 6Z"
        />
        <g fill="none" stroke={INK} strokeWidth="2.6">
          <circle cx="-9.5" cy="5" r="7" />
          <circle cx="10.5" cy="5" r="7" />
          <path d="M-2.5 5h5" />
        </g>
        <path d="M-4 17q4 4 8 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}
