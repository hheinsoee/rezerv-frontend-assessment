// oxlint-disable react/only-export-components -- content module: exports copy

import type { ReactNode } from 'react'
import { SCENES } from '../../lib/scenes'
import type { Scene } from '../../lib/scenes'
import { Button } from '../ui/Button'
import { ArrowRight, Check } from 'lucide-react'

function Lines({ a, b }: { a: ReactNode; b: ReactNode }) {
  return (
    <>
      <span data-line className="line-mask">
        <span className="block">{a}</span>
      </span>
      <span data-line className="line-mask">
        <span className="block">{b}</span>
      </span>
    </>
  )
}

function TimeChip({ scene, kicker }: { scene: Scene; kicker: string }) {
  return (
    <p
      data-in
      className={`inline-flex items-center gap-3 rounded-pill border px-3.5 py-1.5 text-xs font-semibold tracking-[0.1em] uppercase ${
        scene.dark ? 'border-paper/20 bg-paper/5' : 'border-ink/15 bg-paper'
      }`}
    >
      <span className="font-display tabular-nums">{scene.time}</span>
      <span className={scene.dark ? 'text-paper/55' : 'text-ink/55'}>{kicker}</span>
    </p>
  )
}

function Hour({
  scene,
  kicker,
  title,
  body,
  stat,
}: {
  scene: Scene
  kicker: string
  title: ReactNode
  body: string
  stat: string
}) {
  return (
    <div className="mx-auto w-full max-w-[82rem]">
      <div className={`max-w-[34rem] ${scene.dark ? 'text-paper' : ''}`}>
        <TimeChip scene={scene} kicker={kicker} />
        <h2 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.5rem)] leading-[1.02] font-extrabold tracking-[-0.03em] sm:mt-5">
          {title}
        </h2>
        <p
          data-in
          className={`mt-4 max-w-[44ch] text-sm leading-relaxed sm:mt-5 sm:text-base ${
            scene.dark ? 'text-paper/65' : 'text-ink/70'
          }`}
        >
          {body}
        </p>
        <p data-in className={`mt-5 text-sm ${scene.dark ? 'text-paper/50' : 'text-ink/50'}`}>
          {stat}
        </p>
      </div>
    </div>
  )
}

const OPEN = (
  <div className="mx-auto w-full max-w-[82rem]">
    <div className="max-w-[34rem]">
      <TimeChip scene={SCENES[0]} kicker="Doors open" />

      <h1 className="mt-4 font-display text-[clamp(2.05rem,5.6vw,4.4rem)] leading-[0.98] font-extrabold tracking-[-0.035em] sm:mt-5">
        <span data-line className="line-mask">
          <span className="block whitespace-nowrap">One day.</span>
        </span>
        <span data-line className="line-mask">
          <span className="block whitespace-nowrap">One system</span>
        </span>
        <span data-line className="line-mask">
          <span className="block whitespace-nowrap text-green">running it.</span>
        </span>
      </h1>

      <p data-in className="mt-4 max-w-[44ch] text-sm leading-relaxed text-ink/70 sm:mt-6 sm:text-base">
        Scroll through one day of training at a DCBA studio: 6am meditation, a strength
        bar, lunch HIIT, a cool-down walk, lights out. The software runs the day so he
        only has to move.
      </p>

      <div data-in className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
        <Button>
          Start free trial
          <ArrowRight aria-hidden className="size-4" />
        </Button>
        <Button variant="ghost">Watch the 2-min tour</Button>
      </div>

      <ul data-in className="mt-8 hidden flex-wrap gap-x-6 gap-y-2 text-sm text-ink/65 sm:flex">
        {['No setup fee', 'Migrates your timetable', 'Cancel anytime'].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check aria-hidden className="size-4 text-green" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
)

const CLOSE = (
  <div className="mx-auto max-w-[44rem] text-center text-paper">
    <TimeChip scene={SCENES[4]} kicker="Lights out" />

    <h2 className="mt-5 font-display text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.03] font-extrabold tracking-[-0.03em]">
      <Lines
        a="The day closed"
        b={
          <>
            <span className="text-green">itself</span>.
          </>
        }
      />
    </h2>

    <p data-in className="mx-auto mt-5 max-w-[42ch] text-base leading-relaxed text-paper/65">
      Payouts reconciled, tomorrow's roster published, the no-shows already invoiced. Your evening
      is yours.
    </p>

    <div data-in className="mt-8 flex flex-wrap justify-center gap-3">
      <Button variant="invert">
        Start free trial
        <ArrowRight aria-hidden className="size-4" />
      </Button>
      <Button variant="primary">Book a demo</Button>
    </div>
  </div>
)

export const COPY: Record<string, ReactNode> = {
  open: OPEN,

  flow: (
    <Hour
      scene={SCENES[1]}
      kicker="Strength 45"
      title={<Lines a="Rack it," b="press it out." />}
      body="Five rounds of overhead press before the lunch crowd arrives. The bar goes up, the coach counts, and the spot he is standing in was booked from a phone in bed."
      stat="5 × 8 overhead press · 40kg on the bar"
    />
  ),

  hiit: (
    <Hour
      scene={SCENES[2]}
      kicker="Lunch HIIT"
      title={<Lines a="Chest to floor," b="forty-five times." />}
      body="Twelve minutes of push-ups, burpees and not much mercy. He checked in with a QR code on the way through the door; the wall timer does the rest."
      stat="12 min AMRAP · 45 push-ups"
    />
  ),

  peak: (
    <Hour
      scene={SCENES[3]}
      kicker="Peak hour"
      title={<Lines a="Cool down," b="walk it off." />}
      body="Between the five o'clock classes he walks the floor, shakes his shoulders loose and refills the bottle. Heart rate down, next class already on the screen."
      stat="8,400 steps · resting heart rate 62"
    />
  ),

  close: CLOSE,
}

export const PLACEMENT: Record<string, string> = {
  open: 'items-end pb-24 lg:items-center lg:pb-0',
  flow: 'items-end pb-24 lg:items-center lg:pb-0',
  hiit: 'items-end pb-24 lg:items-center lg:pb-0',
  peak: 'items-end pb-24 lg:items-center lg:pb-0',
  close: 'items-center justify-center',
}

export const LABELS: Record<string, string> = {
  open: 'DCBA — one day, one system running it',
  flow: '09:30 — Strength 45',
  hiit: '12:15 — Lunch HIIT',
  peak: '17:45 — peak hour',
  close: '20:00 — lights out',
}
