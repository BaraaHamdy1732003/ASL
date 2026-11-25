export type FingerState = 'up' | 'curl' | 'hook' | 'bent' | 'out'
export type ThumbState =
  | 'out'
  | 'up'
  | 'across'
  | 'fold'
  | 'tuckIM'
  | 'under2'
  | 'under3'
  | 'touchIndex'
  | 'touchAll'
  | 'curve'

export interface HandShape {
  index: FingerState
  middle: FingerState
  ring: FingerState
  pinky: FingerState
  thumb: ThumbState
  /** per-finger tilt in degrees, order: index, middle, ring, pinky */
  angles?: [number, number, number, number]
  /** rotate the whole hand (degrees); e.g. -90 points the fingers sideways */
  rotate?: number
}

export type Anchor =
  | 'neutral'
  | 'forehead'
  | 'chin'
  | 'mouth'
  | 'cheek'
  | 'chest'
  | 'shoulder'
  | 'lowChest'

export type PathKind = 'none' | 'line' | 'tap' | 'circle' | 'wave' | 'twist' | 'trace'

export interface Keyframe {
  anchor: Anchor
  dx?: number
  dy?: number
  shape: HandShape
  rotate?: number
  label: string
}

export interface Motion {
  start: Keyframe
  end: Keyframe
  path: PathKind
  repeat?: number
  /** normalized points (0..1) used when path === 'trace' */
  trace?: [number, number][]
  direction: string
}

/** How far the content has been checked against a published reference. */
export type Fidelity = 'schematic' | 'complex'

export interface AlphabetEntry {
  letter: string
  handshape: string
  summary: string
  steps: string[]
  mistakes: string[]
  tip?: string
  motion: boolean
  fidelity: Fidelity
  shape: HandShape
  trace?: [number, number][]
  similarTo: string[]
}

export interface VocabEntry {
  id: string
  word: string
  category: CategoryId
  handshape: string
  steps: string[]
  movement: string
  nonManual?: string
  example: string
  notes?: string
  related: string[]
  motion: Motion
  /** Set when the sign is made of several parts and the animation only shows one. */
  partial?: string
  fidelity?: Fidelity
}

export type CategoryId =
  | 'greetings'
  | 'everyday'
  | 'family'
  | 'emotions'
  | 'food'
  | 'numbers'
  | 'education'

export interface Category {
  id: CategoryId
  name: string
  blurb: string
  emoji: string
  tone: string
}
