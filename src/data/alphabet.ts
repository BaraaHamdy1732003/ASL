import type { AlphabetEntry, FingerState as F, HandShape, ThumbState as T } from '../types'

const shape = (
  index: F,
  middle: F,
  ring: F,
  pinky: F,
  thumb: T,
  extra: Partial<HandShape> = {},
): HandShape => ({ index, middle, ring, pinky, thumb, ...extra })

const fist = (thumb: T, extra: Partial<HandShape> = {}) => shape('curl', 'curl', 'curl', 'curl', thumb, extra)

const J_TRACE: [number, number][] = [
  [0.72, 0.05],
  [0.72, 0.6],
  [0.6, 0.88],
  [0.3, 0.8],
]
const Z_TRACE: [number, number][] = [
  [0.15, 0.15],
  [0.85, 0.15],
  [0.15, 0.85],
  [0.85, 0.85],
]

type Raw = Omit<AlphabetEntry, 'letter' | 'fidelity' | 'motion' | 'similarTo'> & {
  fidelity?: AlphabetEntry['fidelity']
  motion?: boolean
  similarTo?: string[]
}

const raw: Record<string, Raw> = {
  A: {
    handshape: 'Closed fist, thumb alongside',
    summary: 'A fist with the thumb resting against the side of the index finger.',
    steps: [
      'Make a fist with your fingers curled into the palm.',
      'Rest your thumb along the side of your index finger, pointing up.',
      'Face the palm away from you, toward the person you are signing to.',
    ],
    mistakes: ['Tucking the thumb across the front of the fingers (that is S).', 'Hiding the thumb inside the fist.'],
    shape: fist('up'),
    similarTo: ['S', 'T', 'E'],
  },
  B: {
    handshape: 'Flat hand, thumb folded',
    summary: 'Four fingers straight up and together, thumb folded across the palm.',
    steps: [
      'Hold your four fingers straight up, pressed together.',
      'Fold your thumb across the middle of your palm.',
      'Face the palm outward.',
    ],
    mistakes: ['Spreading the fingers apart.', 'Letting the thumb stick out to the side.'],
    shape: shape('up', 'up', 'up', 'up', 'fold'),
    similarTo: ['U', 'F'],
  },
  C: {
    handshape: 'Curved C',
    summary: 'Fingers and thumb curve together to make the shape of the letter C.',
    steps: [
      'Curve all four fingers together, keeping them rounded.',
      'Curve your thumb to oppose the fingers so the gap looks like a C.',
      'Turn the hand so the side of the hand faces the viewer.',
    ],
    mistakes: ['Closing the gap so it becomes an O.', 'Flattening the fingers into an L shape.'],
    shape: shape('bent', 'bent', 'bent', 'bent', 'curve'),
    fidelity: 'complex',
    similarTo: ['O'],
  },
  D: {
    handshape: 'Index up, circle with thumb',
    summary: 'Index finger points up while the other fingers touch the thumb.',
    steps: [
      'Point your index finger straight up.',
      'Curl your middle, ring, and little fingers so they touch the tip of your thumb.',
      'Face the palm outward.',
    ],
    mistakes: ['Bending the index finger.', 'Leaving the thumb away from the other fingers.'],
    shape: shape('up', 'curl', 'curl', 'curl', 'touchAll'),
    similarTo: ['1', 'G'],
  },
  E: {
    handshape: 'Curled fingers over thumb',
    summary: 'Fingertips bend down to touch the thumb, which tucks underneath.',
    steps: [
      'Bend all four fingers down so the fingertips rest against your thumb.',
      'Tuck the thumb underneath the fingertips.',
      'Face the palm outward with the knuckles slightly rounded.',
    ],
    mistakes: ['Making a full fist with the thumb on the outside (that is S).', 'Leaving the fingers straight.'],
    shape: fist('fold'),
    fidelity: 'complex',
    similarTo: ['S', 'A', 'M', 'N'],
  },
  F: {
    handshape: 'OK-circle with three fingers up',
    summary: 'Index and thumb touch in a circle; the other three fingers stand up.',
    steps: [
      'Touch the tip of your index finger to the tip of your thumb.',
      'Extend your middle, ring, and little fingers upward, slightly spread.',
      'Face the palm outward.',
    ],
    mistakes: ['Keeping the three fingers together or curled.', 'Not closing the circle.'],
    shape: shape('bent', 'up', 'up', 'up', 'touchIndex', { angles: [0, 4, 8, 12] }),
    similarTo: ['O', 'W'],
  },
  G: {
    handshape: 'Index and thumb pointing sideways',
    summary: 'Index finger and thumb extend sideways, parallel, like a small pinch.',
    steps: [
      'Make a fist, then extend your index finger and thumb so they run parallel.',
      'Point them sideways with the palm facing toward your body.',
      'Hold the hand roughly at shoulder height.',
    ],
    mistakes: ['Pointing the fingers up instead of sideways.', 'Spreading the thumb away from the index finger.'],
    shape: shape('up', 'curl', 'curl', 'curl', 'up', { rotate: -90 }),
    similarTo: ['Q', 'L'],
  },
  H: {
    handshape: 'Two fingers pointing sideways',
    summary: 'Index and middle fingers extend sideways together.',
    steps: [
      'Extend your index and middle fingers together; fold the others down with the thumb.',
      'Point the two fingers sideways with the palm facing toward your body.',
    ],
    mistakes: ['Pointing the fingers upward (that is U).', 'Spreading the two fingers apart.'],
    shape: shape('up', 'up', 'curl', 'curl', 'across', { rotate: -90 }),
    similarTo: ['U', 'G'],
  },
  I: {
    handshape: 'Little finger up',
    summary: 'Fist with only the little finger raised.',
    steps: [
      'Make a fist.',
      'Raise your little finger straight up.',
      'Keep your thumb folded across the other fingers, palm facing outward.',
    ],
    mistakes: ['Raising the ring finger too.', 'Sticking the thumb out (that is Y).'],
    shape: shape('curl', 'curl', 'curl', 'up', 'across'),
    similarTo: ['J', 'Y'],
  },
  J: {
    handshape: 'I-handshape that traces a J',
    summary: 'Form the letter I, then draw a J in the air with the little finger.',
    steps: [
      'Start with the I handshape: fist with the little finger up.',
      'Draw a J in the air: down, then curving back toward the signer.',
      'Keep the wrist relaxed; the movement comes from the forearm.',
    ],
    mistakes: ['Skipping the movement and signing it as I.', 'Drawing the J backwards.'],
    motion: true,
    shape: shape('curl', 'curl', 'curl', 'up', 'across'),
    trace: J_TRACE,
    similarTo: ['I'],
  },
  K: {
    handshape: 'Index and middle up, thumb between',
    summary: 'Index and middle fingers point up in a V while the thumb touches the middle finger.',
    steps: [
      'Point your index and middle fingers up, slightly apart.',
      'Place the tip of your thumb against the lower part of the middle finger.',
      'Fold the ring and little fingers down.',
    ],
    mistakes: ['Putting the thumb beside the fingers instead of touching the middle finger.', 'Pressing the fingers together (that is U).'],
    shape: shape('up', 'up', 'curl', 'curl', 'touchIndex', { angles: [-4, 12, 0, 0] }),
    fidelity: 'complex',
    similarTo: ['V', 'P'],
  },
  L: {
    handshape: 'L shape',
    summary: 'Index finger points up and thumb points out to form an L.',
    steps: [
      'Extend your index finger straight up.',
      'Extend your thumb out to the side to make a right angle.',
      'Curl the other three fingers into the palm; palm faces outward.',
    ],
    mistakes: ['Letting the thumb droop.', 'Leaving the other fingers loose.'],
    shape: shape('up', 'curl', 'curl', 'curl', 'out'),
    similarTo: ['G'],
  },
  M: {
    handshape: 'Three fingers over thumb',
    summary: 'The index, middle, and ring fingers fold down over the thumb.',
    steps: [
      'Tuck your thumb under your first three fingers.',
      'Fold the index, middle, and ring fingers over the thumb.',
      'Your little finger stays curled; face the palm outward.',
    ],
    mistakes: ['Only covering the thumb with two fingers (that is N).', 'Placing the thumb on top of the fingers.'],
    shape: fist('under3'),
    fidelity: 'complex',
    similarTo: ['N', 'S', 'T'],
  },
  N: {
    handshape: 'Two fingers over thumb',
    summary: 'The index and middle fingers fold down over the thumb.',
    steps: [
      'Tuck your thumb under your index and middle fingers.',
      'Fold only those two fingers over the thumb.',
      'The ring and little fingers stay curled; palm faces outward.',
    ],
    mistakes: ['Covering the thumb with three fingers (that is M).'],
    shape: fist('under2'),
    fidelity: 'complex',
    similarTo: ['M', 'T'],
  },
  O: {
    handshape: 'Round O',
    summary: 'All fingertips curve to meet the thumb, forming an O.',
    steps: [
      'Curve all your fingers and bring the fingertips to touch your thumb.',
      'Keep the shape rounded so there is an open space inside.',
    ],
    mistakes: ['Flattening the fingers.', 'Leaving a gap between the fingertips and thumb.'],
    shape: shape('bent', 'bent', 'bent', 'bent', 'touchAll'),
    fidelity: 'complex',
    similarTo: ['C', 'F'],
  },
  P: {
    handshape: 'K handshape pointing down',
    summary: 'Same hand as K, but angled so the fingers point downward.',
    steps: [
      'Form the K handshape: index and middle fingers apart, thumb touching the middle finger.',
      'Turn the hand so the fingers point down and the palm faces away from you.',
    ],
    mistakes: ['Keeping the fingers pointing up (that is K).'],
    shape: shape('up', 'up', 'curl', 'curl', 'touchIndex', { angles: [-4, 12, 0, 0], rotate: 180 }),
    fidelity: 'complex',
    similarTo: ['K', 'Q'],
  },
  Q: {
    handshape: 'G handshape pointing down',
    summary: 'Same hand as G, angled so the index finger and thumb point downward.',
    steps: [
      'Form the G handshape: index finger and thumb parallel.',
      'Turn the hand so both point down toward the floor.',
    ],
    mistakes: ['Keeping the hand sideways (that is G).'],
    shape: shape('up', 'curl', 'curl', 'curl', 'up', { rotate: 180 }),
    fidelity: 'complex',
    similarTo: ['G', 'P'],
  },
  R: {
    handshape: 'Crossed fingers',
    summary: 'Index and middle fingers cross, pointing up.',
    steps: [
      'Extend your index and middle fingers upward.',
      'Cross the middle finger over the index finger.',
      'Fold the other fingers down with the thumb; palm faces outward.',
    ],
    mistakes: ['Leaving the two fingers uncrossed (that is U or V).'],
    shape: shape('up', 'up', 'curl', 'curl', 'across', { angles: [-9, 9, 0, 0] }),
    fidelity: 'complex',
    similarTo: ['U', 'V'],
  },
  S: {
    handshape: 'Fist, thumb across fingers',
    summary: 'A fist with the thumb wrapped across the front of the fingers.',
    steps: [
      'Make a fist.',
      'Cross your thumb over the front of your curled fingers.',
      'Face the palm outward.',
    ],
    mistakes: ['Tucking the thumb to the side (that is A).', 'Putting the thumb between fingers (that is T).'],
    shape: fist('across'),
    similarTo: ['A', 'T', 'E'],
  },
  T: {
    handshape: 'Thumb between index and middle',
    summary: 'A fist with the thumb poking up between the index and middle fingers.',
    steps: [
      'Make a fist.',
      'Slip your thumb between the index and middle fingers so the tip shows.',
    ],
    mistakes: ['Letting the thumb stay across the front (that is S).', 'Pushing it between the wrong fingers.'],
    shape: fist('tuckIM'),
    fidelity: 'complex',
    similarTo: ['S', 'N', 'M'],
  },
  U: {
    handshape: 'Two fingers up together',
    summary: 'Index and middle fingers point up, pressed together.',
    steps: [
      'Extend your index and middle fingers upward, side by side.',
      'Hold your ring and little fingers down with your thumb.',
      'Palm faces outward.',
    ],
    mistakes: ['Spreading the fingers (that is V).', 'Crossing them (that is R).'],
    shape: shape('up', 'up', 'curl', 'curl', 'across'),
    similarTo: ['V', 'R', 'H'],
  },
  V: {
    handshape: 'Peace sign',
    summary: 'Index and middle fingers point up and spread apart.',
    steps: [
      'Extend your index and middle fingers upward.',
      'Spread them apart to form a V.',
      'Hold the ring and little fingers down with your thumb; palm faces outward.',
    ],
    mistakes: ['Keeping the fingers together (that is U).', 'Spreading too narrowly to read as a V.'],
    shape: shape('up', 'up', 'curl', 'curl', 'across', { angles: [10, -10, 0, 0] }),
    similarTo: ['U', 'K'],
  },
  W: {
    handshape: 'Three fingers spread',
    summary: 'Index, middle, and ring fingers spread up while the thumb holds the little finger.',
    steps: [
      'Extend your index, middle, and ring fingers upward and spread them slightly.',
      'Hold your little finger down with your thumb.',
      'Palm faces outward.',
    ],
    mistakes: ['Raising the little finger too.', 'Keeping the three fingers pressed together.'],
    shape: shape('up', 'up', 'up', 'curl', 'across', { angles: [14, 0, -14, 0] }),
    similarTo: ['F', '6'],
  },
  X: {
    handshape: 'Hooked index finger',
    summary: 'A fist with the index finger bent into a hook.',
    steps: [
      'Make a fist.',
      'Raise your index finger and bend it at the middle joint to form a hook.',
      'Keep the thumb across the other fingers; palm faces outward.',
    ],
    mistakes: ['Straightening the finger (that is D or 1).', 'Bending the finger too tightly into the fist.'],
    shape: shape('hook', 'curl', 'curl', 'curl', 'across'),
    similarTo: ['D'],
  },
  Y: {
    handshape: 'Thumb and little finger out',
    summary: 'Thumb and little finger extend; the other fingers curl in.',
    steps: [
      'Curl your index, middle, and ring fingers into the palm.',
      'Extend your thumb and little finger outward.',
      'Palm faces outward (shaka-style hand).',
    ],
    mistakes: ['Letting the thumb tuck in (that is I).'],
    shape: shape('curl', 'curl', 'curl', 'up', 'out', { angles: [0, 0, 0, -6] }),
    similarTo: ['I'],
  },
  Z: {
    handshape: 'Index finger traces a Z',
    summary: 'Index finger points forward and draws a Z in the air.',
    steps: [
      'Point your index finger (a 1 handshape).',
      'Draw a Z in the air: across, diagonally down, then across again.',
    ],
    mistakes: ['Drawing the Z too small to read.', 'Drawing it mirrored.'],
    motion: true,
    shape: shape('up', 'curl', 'curl', 'curl', 'across'),
    trace: Z_TRACE,
    similarTo: ['D', 'X'],
  },
}

export const ALPHABET: AlphabetEntry[] = Object.entries(raw).map(([letter, r]) => ({
  letter,
  fidelity: 'schematic',
  motion: false,
  similarTo: [],
  ...r,
}))

export const letterByChar = (c: string) => ALPHABET.find((a) => a.letter === c.toUpperCase())
