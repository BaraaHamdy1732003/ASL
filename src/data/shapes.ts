import type { FingerState as F, HandShape, ThumbState as T } from '../types'

export const shape = (
  index: F,
  middle: F,
  ring: F,
  pinky: F,
  thumb: T,
  extra: Partial<HandShape> = {},
): HandShape => ({ index, middle, ring, pinky, thumb, ...extra })

export const FLAT = shape('up', 'up', 'up', 'up', 'fold')
export const OPEN5 = shape('up', 'up', 'up', 'up', 'out', { angles: [10, 3, -3, -10] })
export const FIST_A = shape('curl', 'curl', 'curl', 'curl', 'up')
export const FIST_S = shape('curl', 'curl', 'curl', 'curl', 'across')
export const HAND_L = shape('up', 'curl', 'curl', 'curl', 'out')
export const HAND_Y = shape('curl', 'curl', 'curl', 'up', 'out')
export const HAND_W = shape('up', 'up', 'up', 'curl', 'across', { angles: [14, 0, -14, 0] })
export const HAND_X = shape('hook', 'curl', 'curl', 'curl', 'across')
export const HAND_C = shape('bent', 'bent', 'bent', 'bent', 'curve')
export const HAND_F = shape('bent', 'up', 'up', 'up', 'touchIndex', { angles: [0, 4, 8, 12] })
export const FLAT_O = shape('bent', 'bent', 'bent', 'bent', 'touchAll')
export const BENT_B = shape('bent', 'bent', 'bent', 'bent', 'fold')
export const CLAW = shape('bent', 'bent', 'bent', 'bent', 'curve', { angles: [8, 3, -3, -8] })
export const MIDDLE_BENT = shape('up', 'hook', 'up', 'up', 'out', { angles: [10, 0, -6, -12] })
export const NO_HAND = shape('up', 'up', 'curl', 'curl', 'out', { angles: [6, -6, 0, 0] })

export const ONE = shape('up', 'curl', 'curl', 'curl', 'across')
export const TWO = shape('up', 'up', 'curl', 'curl', 'across', { angles: [10, -10, 0, 0] })
export const THREE = shape('up', 'up', 'curl', 'curl', 'out', { angles: [8, -8, 0, 0] })
export const FOUR = shape('up', 'up', 'up', 'up', 'fold', { angles: [8, 3, -3, -8] })
