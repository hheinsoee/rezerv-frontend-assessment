import { useCallback, useEffect, useState } from 'react'
import { Chrome } from './components/Chrome'
import { Preloader } from './components/Preloader'
import { Story } from './components/Story'
import { usePageSlider } from './hooks/usePageSlider'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { ScrollTrigger } from './lib/gsap'
import { REDUCED_MOTION, useMediaQuery } from './lib/motion'
import { PRELOAD } from './lib/props'
import { SCENES } from './lib/scenes'

type Phase = 'loading' | 'revealing' | 'ready'

export default function App() {
  const reduced = useMediaQuery(REDUCED_MOTION)
  const [phase, setPhase] = useState<Phase>('loading')

  useSmoothScroll(!reduced, phase === 'loading')

  const slider = usePageSlider(!reduced && phase === 'ready', SCENES.length)

  const handleReveal = useCallback(() => setPhase((p) => (p === 'loading' ? 'revealing' : p)), [])
  const handleDone = useCallback(() => setPhase('ready'), [])

  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <main>
        <Story revealed={phase !== 'loading'} reduced={reduced} />
      </main>
      <Chrome index={slider.index} count={SCENES.length} onGoTo={slider.goTo} reduced={reduced} />

      <label className="fixed top-4 right-4 z-[var(--z-top)] flex items-center gap-2 text-xs text-paper/70 mix-blend-difference">
        <input
          type="checkbox"
          checked={phase !== 'ready'}
          onChange={(event) => setPhase(event.target.checked ? 'loading' : 'ready')}
        />
        splash
      </label>

      {phase === 'ready' ? null : (
        <Preloader
          sources={PRELOAD}
          reduced={reduced}
          onReveal={handleReveal}
          onDone={handleDone}
        />
      )}
    </>
  )
}
