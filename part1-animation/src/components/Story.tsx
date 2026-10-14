import { SCENES } from '../lib/scenes'
import { POSES } from '../lib/poses'
import { Athlete } from './Athlete'
import { StorySlider } from './story/StorySlider'
import { COPY, LABELS } from './story/copy'

interface StoryProps {

  revealed: boolean
  reduced: boolean
}

export function Story({ revealed, reduced }: StoryProps) {
  return reduced ? <StoryStatic /> : <StorySlider revealed={revealed} />
}

function StoryStatic() {
  return (
    <div>
      {SCENES.map((scene) => (
        <section
          key={scene.id}
          className={`relative ${scene.backdrop} px-5 py-20 sm:px-8`}
          aria-label={LABELS[scene.id]}
        >
          <div className="mx-auto grid max-w-[72rem] items-center gap-8 lg:grid-cols-2">
            {scene.camera.opacity > 0 ? (
              <Athlete
                pose={POSES[scene.pose]}
                className="mx-auto w-full max-w-[22rem]"
                label={LABELS[scene.id]}
              />
            ) : null}
            <div>{COPY[scene.id]}</div>
          </div>
        </section>
      ))}
    </div>
  )
}
