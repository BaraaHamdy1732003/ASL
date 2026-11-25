import type { AlphabetEntry, Motion } from '../types'

export function motionForLetter(e: AlphabetEntry): Motion {
  const frame = { anchor: 'neutral' as const, shape: e.shape, label: e.motion ? 'Start in this handshape' : 'Hold this handshape' }
  return {
    start: frame,
    end: { ...frame, label: e.motion ? 'Finish the traced letter' : 'Hold this handshape' },
    path: e.trace ? 'trace' : 'none',
    trace: e.trace,
    direction: e.trace ? `Trace the letter ${e.letter} in the air.` : 'No movement. Hold the handshape steady.',
    repeat: 1,
  }
}
