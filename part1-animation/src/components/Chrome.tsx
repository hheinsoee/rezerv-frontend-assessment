import { SCENES } from '../lib/scenes'
import { Wordmark } from './ui/Wordmark'
import { CalendarDays, Heart, Zap } from 'lucide-react'

const LINKS = [
  { label: 'Community', Icon: Heart },
  { label: 'Timetable', Icon: CalendarDays },
  { label: 'Status', Icon: Zap },
]

interface ChromeProps {
  index: number
  count: number
  onGoTo: (index: number) => void
  reduced: boolean
}

export function Chrome({ index, count, onGoTo, reduced }: ChromeProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[var(--z-chrome)]">
      <div data-chrome className="pointer-events-auto absolute top-5 left-5 sm:top-7 sm:left-8">
        <Wordmark className="night-flip text-xl text-ink sm:text-2xl" />
      </div>

      <div
        data-chrome
        className="pointer-events-auto absolute bottom-5 left-5 flex gap-2 sm:bottom-7 sm:left-8"
      >
        {LINKS.map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="night-invert group grid size-10 place-items-center rounded-pill bg-ink text-paper transition-transform duration-[var(--dur-base)] ease-out-back hover:-translate-y-1 hover:rotate-6"
          >
            <Icon aria-hidden className="size-4 transition-transform duration-[var(--dur-base)] ease-out-back group-hover:scale-110" />
          </button>
        ))}
      </div>

      {reduced ? null : (
        <nav
          data-chrome
          aria-label="Pages"
          className="pointer-events-auto absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col items-center gap-3 sm:right-6 md:flex"
        >
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onGoTo(i)}
              aria-label={`${SCENES[i].time} — page ${i + 1} of ${count}`}
              aria-current={i === index ? 'true' : undefined}
              className="group grid size-6 place-items-center"
            >
              <span
                className={`night-dot block rounded-pill border-2 border-contour transition-all duration-[var(--dur-base)] ease-out-back group-hover:scale-125 ${
                  i === index ? 'h-5 w-2.5 bg-green' : 'size-2.5 bg-paper'
                }`}
              />
              <span className="sr-only">{SCENES[i].time}</span>
            </button>
          ))}
        </nav>
      )}

      <button
        data-chrome
        type="button"
        className="night-invert group pointer-events-auto absolute right-5 bottom-5 flex h-10 items-center gap-2 overflow-hidden rounded-pill bg-ink pr-5 pl-4 text-[0.68rem] font-semibold tracking-[0.18em] text-paper uppercase transition-transform duration-[var(--dur-base)] ease-out-back hover:-translate-y-1 sm:right-8 sm:bottom-7"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-bottom scale-y-0 bg-green transition-transform duration-[var(--dur-base)] ease-out-expo group-hover:scale-y-100"
        />
        <CalendarDays
          aria-hidden
          className="relative size-4 transition-transform duration-[var(--dur-base)] ease-out-back group-hover:scale-110"
        />
        <span className="relative transition-colors duration-[var(--dur-base)] group-hover:text-ink">
          book a demo
        </span>
      </button>
    </div>
  )
}
