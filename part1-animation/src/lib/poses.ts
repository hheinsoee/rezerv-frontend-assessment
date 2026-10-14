import type { Pose } from './rig'

export const POSES = {
  meditate: {
    hip: { x: 200, y: 288 },
    torso: -92,
    head: -88,
    armBack: [64, 44],
    armFront: [72, 52],
    legBack: [156, -16],
    legFront: [24, 202],
  },

  lift: {
    hip: { x: 200, y: 218 },
    torso: -90,
    head: -90,
    armBack: [168, -95],
    armFront: [12, -85],
    legBack: [96, 90],
    legFront: [84, 90],
  },

  pushUp: {
    hip: { x: 206, y: 256 },
    torso: -22,
    head: -14,
    armBack: [84, 96],
    armFront: [94, 86],
    legBack: [152, 156],
    legFront: [156, 150],
  },

  walk: {
    hip: { x: 200, y: 214 },
    torso: -88,
    head: -90,
    armBack: [100, 112],
    armFront: [80, 68],
    legBack: [100, 108],
    legFront: [80, 84],
  },

  finish: {
    hip: { x: 200, y: 214 },
    torso: -94,
    head: -92,
    armBack: [-108, -98],
    armFront: [-74, -86],
    legBack: [94, 90],
    legFront: [38, 106],
  },
} as const satisfies Record<string, Pose>

export type PoseName = keyof typeof POSES

const TAU = Math.PI * 2
const osc = (time: number, rate: number, phase = 0) => Math.sin(time * rate * TAU + phase)

export const MOTIONS: Record<PoseName, (pose: Pose, time: number) => Pose> = {
  meditate: (pose, time) => ({
    ...pose,
    torso: pose.torso + osc(time, 0.2) * 1.4,
    head: pose.head + osc(time, 0.2) * 1.8,
    armFront: [pose.armFront[0] + osc(time, 0.2) * 2, pose.armFront[1]],
    armBack: [pose.armBack[0] + osc(time, 0.2) * 2, pose.armBack[1]],
  }),

  lift: (pose, time) => {
    const up = (osc(time, 0.4) + 1) / 2
    const dip = (1 - up) * 8
    return {
      ...pose,
      hip: { x: pose.hip.x, y: pose.hip.y + dip * 0.6 },
      head: pose.head + up * 3,
      armBack: [pose.armBack[0] + up * 80, pose.armBack[1] + up * 4],
      armFront: [pose.armFront[0] - up * 80, pose.armFront[1] - up * 4],
      legBack: [pose.legBack[0] + dip * 0.5, pose.legBack[1] + dip],
      legFront: [pose.legFront[0] - dip * 0.5, pose.legFront[1] + dip],
    }
  },

  pushUp: (pose, time) => {
    const down = (osc(time, 0.5) + 1) / 2
    return {
      ...pose,
      hip: { x: pose.hip.x, y: pose.hip.y + down * 9 },
      torso: pose.torso + down * 7,
      head: pose.head + down * 10,
      armFront: [pose.armFront[0] + down * 26, pose.armFront[1] - down * 34],
      armBack: [pose.armBack[0] + down * 26, pose.armBack[1] - down * 34],
    }
  },

  walk: (pose, time) => {
    const rate = 0.75
    const front = osc(time, rate)
    const back = osc(time, rate, Math.PI)
    return {
      ...pose,
      hip: { x: pose.hip.x, y: pose.hip.y - Math.abs(front) * 4 },
      torso: pose.torso + front * 1.6,
      head: pose.head + osc(time, rate * 2) * 1.2,
      armFront: [pose.armFront[0] + back * 20, pose.armFront[1] + back * 16],
      armBack: [pose.armBack[0] + front * 20, pose.armBack[1] + front * 16],
      legFront: [
        pose.legFront[0] + front * 24,
        pose.legFront[1] + front * 24 + (front < 0 ? -front * 30 : front * 10),
      ],
      legBack: [
        pose.legBack[0] + back * 24,
        pose.legBack[1] + back * 24 + (back < 0 ? -back * 30 : back * 10),
      ],
    }
  },

  finish: (pose, time) => {
    const hop = Math.abs(osc(time, 0.8))
    return {
      ...pose,
      hip: { x: pose.hip.x, y: pose.hip.y - hop * 10 },
      armFront: [pose.armFront[0] - hop * 10, pose.armFront[1] - hop * 12],
      armBack: [pose.armBack[0] - hop * 10, pose.armBack[1] - hop * 12],
      legFront: [pose.legFront[0] - hop * 10, pose.legFront[1] + hop * 14],
      legBack: [pose.legBack[0] + hop * 4, pose.legBack[1] + hop * 6],
    }
  },
}
