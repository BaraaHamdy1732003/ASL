import type { FingerState, HandShape, ThumbState } from '../types'

const SKIN = '#F4CDAE'
const SHADE = '#E3AC86'
const TIP = '#F9DFC9'
const LINE = '#172554'

const BASE = 132
const FINGERS = [
  { key: 'index', cx: 138, len: 84 },
  { key: 'middle', cx: 114, len: 92 },
  { key: 'ring', cx: 90, len: 84 },
  { key: 'pinky', cx: 66, len: 66 },
] as const

function Finger({ cx, len, state, angle }: { cx: number; len: number; state: FingerState; angle: number }) {
  const w = 22
  const common = { stroke: LINE, strokeWidth: 2.5, strokeLinejoin: 'round' as const }
  let body: JSX.Element
  switch (state) {
    case 'up':
      body = (
        <>
          <rect x={cx - w / 2} y={BASE - len} width={w} height={len + 14} rx={11} fill={SKIN} {...common} />
          <path d={`M${cx - 6} ${BASE - len * 0.38} h12 M${cx - 6} ${BASE - len * 0.7} h12`} stroke={SHADE} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      break
    case 'curl':
      body = (
        <>
          <rect x={cx - w / 2} y={BASE - 2} width={w} height={44} rx={11} fill={SHADE} {...common} />
          <path d={`M${cx - 6} ${BASE + 14} h12`} stroke={LINE} strokeWidth={2} strokeLinecap="round" opacity={0.45} />
        </>
      )
      break
    case 'hook':
      body = (
        <>
          <rect x={cx - w / 2} y={BASE - len * 0.55} width={w} height={len * 0.55 + 14} rx={11} fill={SKIN} {...common} />
          <ellipse cx={cx} cy={BASE - len * 0.55 - 2} rx={9} ry={11} fill={TIP} {...common} />
        </>
      )
      break
    case 'bent':
      body = (
        <>
          <rect x={cx - w / 2} y={BASE - len * 0.62} width={w} height={len * 0.62 + 14} rx={11} fill={SKIN} {...common} />
          <ellipse cx={cx} cy={BASE - len * 0.62 - 4} rx={9.5} ry={13} fill={TIP} {...common} />
        </>
      )
      break
    case 'out':
    default:
      body = (
        <>
          <rect x={cx - w / 2} y={BASE - len * 0.5} width={w} height={len * 0.5 + 14} rx={11} fill={SKIN} {...common} />
          <circle cx={cx} cy={BASE - len * 0.5} r={12.5} fill={TIP} {...common} />
        </>
      )
  }
  return <g transform={`rotate(${angle} ${cx} ${BASE})`}>{body}</g>
}

function Capsule({ x1, y1, x2, y2, w = 21 }: { x1: number; y1: number; x2: number; y2: number; w?: number }) {
  return (
    <g strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LINE} strokeWidth={w + 5} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SKIN} strokeWidth={w} />
    </g>
  )
}

function Thumb({ state }: { state: ThumbState }) {
  switch (state) {
    case 'out':
      return <Capsule x1={150} y1={200} x2={202} y2={158} />
    case 'up':
      return <Capsule x1={162} y1={198} x2={165} y2={142} w={20} />
    case 'across':
      return <Capsule x1={158} y1={160} x2={64} y2={160} w={22} />
    case 'fold':
      return <Capsule x1={150} y1={196} x2={96} y2={178} w={20} />
    case 'tuckIM':
      return <circle cx={126} cy={156} r={11.5} fill={TIP} stroke={LINE} strokeWidth={2.5} />
    case 'touchIndex':
      return <Capsule x1={150} y1={200} x2={126} y2={150} w={20} />
    case 'touchAll':
      return <Capsule x1={150} y1={200} x2={104} y2={148} w={20} />
    case 'curve':
      return <Capsule x1={150} y1={204} x2={196} y2={190} w={20} />
    default:
      return null
  }
}

/** Behind-the-fingers thumb (M, N) so the curled fingers cover it. */
function BackThumb({ state }: { state: ThumbState }) {
  if (state === 'under3') return <Capsule x1={150} y1={188} x2={88} y2={188} w={20} />
  if (state === 'under2') return <Capsule x1={150} y1={188} x2={112} y2={188} w={20} />
  return null
}

/** Glyph only: drawn inside an existing <svg>, origin at top-left of a 220x250 box. */
export function HandGlyph({ shape }: { shape: HandShape }) {
  const angles = shape.angles ?? [0, 0, 0, 0]
  const states = [shape.index, shape.middle, shape.ring, shape.pinky]
  const order = [0, 1, 2, 3].sort((a, b) => (states[a] === 'curl' ? -1 : 0) - (states[b] === 'curl' ? -1 : 0))
  return (
    <g transform={shape.rotate ? `rotate(${shape.rotate} 110 150)` : undefined}>
      <BackThumb state={shape.thumb} />
      <rect x={52} y={BASE} width={104} height={98} rx={34} fill={SKIN} stroke={LINE} strokeWidth={2.5} />
      {order.map((i) => (
        <Finger key={FINGERS[i].key} cx={FINGERS[i].cx} len={FINGERS[i].len} state={states[i]} angle={angles[i]} />
      ))}
      <Thumb state={shape.thumb} />
    </g>
  )
}

interface Props {
  shape: HandShape
  label: string
  className?: string
}

/** Standalone schematic hand. `label` is used as the accessible description. */
export default function HandSVG({ shape, label, className }: Props) {
  return (
    <svg viewBox="0 0 220 250" role="img" aria-label={label} className={className}>
      <title>{label}</title>
      <HandGlyph shape={shape} />
    </svg>
  )
}
