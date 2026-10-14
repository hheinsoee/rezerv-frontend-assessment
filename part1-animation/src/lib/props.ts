

const urls = import.meta.glob('../assets/props/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const url = (name: string) => urls[`../assets/props/${name}.svg`]

export const PROPS = {
  dumbbell: url('dumbbell'),
  bottle: url('bottle'),
  stopwatch: url('stopwatch'),
  kettlebell: url('kettlebell'),
} as const

export const PROP_SIZE = 100

export const PRELOAD = [PROPS.dumbbell, PROPS.bottle, PROPS.stopwatch]
