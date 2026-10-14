

export interface Vec {
  x: number
  y: number
}

export type Chain = readonly [number, number]

// A pose is a set of joint angles. We mix two poses to animate the character.
export interface Pose {

  hip: Vec
  torso: number
  head: number

  armBack: Chain
  armFront: Chain
  legBack: Chain
  legFront: Chain

  tilt?: number
}

export const SEGMENT = {
  torso: 66,
  neck: 15,
  head: 26,
  upperArm: 42,
  foreArm: 40,
  thigh: 52,
  shin: 50,
  foot: 18,

  spread: 9,
} as const

const RAD = Math.PI / 180

export function step(from: Vec, angle: number, length: number): Vec {
  return { x: from.x + Math.cos(angle * RAD) * length, y: from.y + Math.sin(angle * RAD) * length }
}

export interface Skeleton {
  hip: Vec
  shoulder: Vec
  neck: Vec
  head: Vec
  headAngle: number
  armBack: Vec[]
  armFront: Vec[]
  legBack: Vec[]
  legFront: Vec[]
  footBack: Vec
  footFront: Vec
}

export function solve(pose: Pose): Skeleton {
  const hip = pose.hip
  const shoulder = step(hip, pose.torso, SEGMENT.torso)
  const neck = step(shoulder, pose.head, SEGMENT.neck)
  const head = step(neck, pose.head, SEGMENT.head)

  const perp = pose.torso + 90
  const shoulderBack = step(shoulder, perp, -SEGMENT.spread)
  const shoulderFront = step(shoulder, perp, SEGMENT.spread)
  const hipBack = step(hip, perp, -SEGMENT.spread)
  const hipFront = step(hip, perp, SEGMENT.spread)

  const limb = (root: Vec, chain: Chain, upper: number, lower: number) => {
    const joint = step(root, chain[0], upper)
    return [root, joint, step(joint, chain[1], lower)]
  }

  const legBack = limb(hipBack, pose.legBack, SEGMENT.thigh, SEGMENT.shin)
  const legFront = limb(hipFront, pose.legFront, SEGMENT.thigh, SEGMENT.shin)

  return {
    hip,
    shoulder,
    neck,
    head,
    headAngle: pose.head,
    armBack: limb(shoulderBack, pose.armBack, SEGMENT.upperArm, SEGMENT.foreArm),
    armFront: limb(shoulderFront, pose.armFront, SEGMENT.upperArm, SEGMENT.foreArm),
    legBack,
    legFront,

    footBack: step(legBack[2], pose.legBack[1] - 70, SEGMENT.foot),
    footFront: step(legFront[2], pose.legFront[1] - 70, SEGMENT.foot),
  }
}

export function polyline(points: Vec[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const n = (x: number, y: number) => x + (y - x) * t
  const chain = (x: Chain, y: Chain): Chain => [n(x[0], y[0]), n(x[1], y[1])]
  return {
    hip: { x: n(a.hip.x, b.hip.x), y: n(a.hip.y, b.hip.y) },
    torso: n(a.torso, b.torso),
    head: n(a.head, b.head),
    armBack: chain(a.armBack, b.armBack),
    armFront: chain(a.armFront, b.armFront),
    legBack: chain(a.legBack, b.legBack),
    legFront: chain(a.legFront, b.legFront),
    tilt: n(a.tilt ?? 0, b.tilt ?? 0),
  }
}
