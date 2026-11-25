import { useEffect, useMemo, useRef, useState } from 'react'
import { Gauge, Pause, Play, RotateCcw, Rotate3d } from 'lucide-react'
import { HandGlyph } from './HandSVG'
import type { Anchor, HandShape, Motion } from '../types'

const ANCHORS: Record<Anchor, [number, number]> = {
  neutral: [150, 300],
  forehead: [168, 72],
  chin: [168, 152],
  mouth: [168, 136],
  cheek: [160, 118],
  chest: [170, 268],
  shoulder: [140, 200],
  lowChest: [160, 330],
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

interface Frame {
  x: number
  y: number
  rot: number
  shape: HandShape
}

function pointOf(anchor: Anchor, dx = 0, dy = 0): [number, number] {
  const [ax, ay] = ANCHORS[anchor]
  return [ax - dx, ay + dy]
}

function tracePoint(points: [number, number][], t: number): [number, number] {
  const lens: number[] = []
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const l = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
    lens.push(l)
    total += l
  }
  let d = t * total
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const u = lens[i] === 0 ? 0 : d / lens[i]
      return [lerp(points[i][0], points[i + 1][0], u), lerp(points[i][1], points[i + 1][1], u)]
    }
    d -= lens[i]
  }
  return points[points.length - 1]
}

const TRACE_SIZE = 200
const TRACE_CENTER: [number, number] = [200, 235]

function traceToStage(trace: [number, number][]): [number, number][] {
  return trace.map(([x, y]) => [
    TRACE_CENTER[0] - TRACE_SIZE / 2 + x * TRACE_SIZE,
    TRACE_CENTER[1] - TRACE_SIZE / 2 + y * TRACE_SIZE,
  ])
}

function frameAt(m: Motion, t: number, variant: 'sign' | 'letter'): Frame {
  const s = m.start
  const e = m.end
  if (variant === 'letter' && m.path !== 'trace') {
    return { x: 200, y: 225, rot: 0, shape: s.shape }
  }
  const [ax, ay] = variant === 'letter' ? [200, 225] : pointOf(s.anchor, s.dx, s.dy)
  const [bx, by] = variant === 'letter' ? [200, 225] : pointOf(e.anchor, e.dx, e.dy)
  const sr = s.rotate ?? 0
  const er = e.rotate ?? 0
  const reps = m.repeat ?? 1
  switch (m.path) {
    case 'line': {
      const u = ease(t)
      return { x: lerp(ax, bx, u), y: lerp(ay, by, u), rot: lerp(sr, er, u), shape: u < 0.6 ? s.shape : e.shape }
    }
    case 'tap': {
      const ph = (t * reps) % 1
      const u = ph < 0.5 ? ease(ph * 2) : ease(2 - ph * 2)
      return { x: lerp(ax, bx, u), y: lerp(ay, by, u), rot: lerp(sr, er, u), shape: u > 0.5 ? e.shape : s.shape }
    }
    case 'circle': {
      const a = t * Math.PI * 2 * reps
      return { x: ax + Math.cos(a) * 14, y: ay + Math.sin(a) * 14, rot: sr, shape: s.shape }
    }
    case 'wave': {
      const w = Math.sin(t * Math.PI * 2 * reps)
      return { x: ax, y: ay, rot: sr + w * 14, shape: w > 0 ? s.shape : e.shape }
    }
    case 'twist': {
      const ph = (t * reps) % 1
      const u = (1 - Math.cos(ph * Math.PI * 2)) / 2
      return { x: lerp(ax, bx, u), y: lerp(ay, by, u), rot: lerp(sr, er, u), shape: s.shape }
    }
    case 'trace': {
      const pts = traceToStage(m.trace ?? [])
      const [x, y] = pts.length ? tracePoint(pts, t) : [ax, ay]
      return { x, y, rot: 0, shape: s.shape }
    }
    default:
      return { x: ax, y: ay, rot: sr, shape: s.shape }
  }
}

interface Props {
  motion: Motion
  label: string
  variant?: 'sign' | 'letter'
  compact?: boolean
  autoPlay?: boolean
  /** hide all text so the sign can be used in a quiz without giving the answer away */
  quiet?: boolean
}

export default function SignDemo({ motion, label, variant = 'sign', compact = false, autoPlay = true, quiet = false }: Props) {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [playing, setPlaying] = useState(autoPlay && !reduced && motion.path !== 'none')
  const [slow, setSlow] = useState(false)
  const [tilt, setTilt] = useState(0)
  const [t, setT] = useState(0)
  const elapsed = useRef(0)
  const last = useRef<number | null>(null)
  const raf = useRef(0)

  const duration = (motion.path === 'trace' ? 2600 : 2200) * (slow ? 2.5 : 1)

  useEffect(() => {
    elapsed.current = 0
    setT(0)
    setPlaying(autoPlay && !reduced && motion.path !== 'none')
  }, [motion, autoPlay, reduced])

  useEffect(() => {
    if (!playing) return
    const tick = (now: number) => {
      if (last.current == null) last.current = now
      elapsed.current += now - last.current
      last.current = now
      setT((elapsed.current % duration) / duration)
      raf.current = requestAnimationFrame(tick)
    }
    last.current = null
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, duration])

  const frame = frameAt(motion, t, variant)
  const scale = variant === 'letter' ? (motion.path === 'trace' ? 0.55 : 1.45) : 0.42
  // when tracing, the path is drawn by the extended fingertip rather than the palm centre
  const sh = motion.start.shape
  const [ox, oy] = motion.path === 'trace' ? (sh.pinky === 'up' ? [66, 62] : [138, 44]) : [104, 170]
  const [sx, sy] = variant === 'letter' ? [200, 225] : pointOf(motion.start.anchor, motion.start.dx, motion.start.dy)
  const [ex, ey] = variant === 'letter' ? [200, 225] : pointOf(motion.end.anchor, motion.end.dx, motion.end.dy)
  const tracePts = motion.path === 'trace' && motion.trace ? traceToStage(motion.trace) : null
  const showPath = variant === 'sign' && motion.path !== 'none' && (sx !== ex || sy !== ey)

  const replay = () => {
    elapsed.current = 0
    last.current = null
    setT(0)
    setPlaying(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 to-white ring-1 ring-navy/5"
        style={{ perspective: 900 }}
      >
        <div style={{ transform: `rotateY(${tilt}deg)`, transition: 'transform 300ms ease' }}>
          <svg viewBox="0 0 400 440" role="img" aria-label={label} className={compact ? 'mx-auto h-60 w-full' : 'mx-auto h-[26rem] w-full'}>
            <title>{label}</title>
            {variant === 'sign' && (
              <g fill="#E3EAF8" stroke="#C3D0EE" strokeWidth="2">
                <path d="M70 440 C70 330 110 252 200 238 C290 252 330 330 330 440 Z" />
                <rect x="178" y="190" width="44" height="60" rx="18" />
                <circle cx="200" cy="106" r="56" />
                <circle cx="180" cy="100" r="4" fill="#94A3B8" stroke="none" />
                <circle cx="220" cy="100" r="4" fill="#94A3B8" stroke="none" />
                <path d="M184 128 q16 10 32 0" fill="none" stroke="#94A3B8" strokeLinecap="round" />
              </g>
            )}
            {tracePts && (
              <>
                <polyline
                  points={tracePts.map((p) => p.join(',')).join(' ')}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="5"
                  strokeDasharray="1 11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={tracePts.map((p) => p.join(',')).join(' ')}
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={`${t} 1`}
                />
              </>
            )}
            {showPath && (
              <>
                <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#3B82F6" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="6 7" />
                <circle cx={sx} cy={sy} r="7" fill="#3B82F6" />
                <circle cx={ex} cy={ey} r="7" fill="#FACC15" stroke="#172554" strokeWidth="2" />
              </>
            )}
            <g transform={`translate(${frame.x} ${frame.y}) rotate(${frame.rot}) scale(${scale}) translate(${-ox} ${-oy})`}>
              <HandGlyph shape={frame.shape} />
            </g>
          </svg>
        </div>
        {!quiet && (
          <span className="chip absolute left-4 top-4 bg-white/90 text-ink-600 ring-1 ring-navy/10">Schematic illustration</span>
        )}
      </div>

      {!compact && (
        <>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Demonstration controls">
            <button className="btn btn-primary" onClick={() => setPlaying((p) => !p)} disabled={motion.path === 'none'}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button className="btn btn-ghost" onClick={replay} disabled={motion.path === 'none'}>
              <RotateCcw size={16} /> Replay
            </button>
            <button
              className={`btn ${slow ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => setSlow((s) => !s)}
              aria-pressed={slow}
              disabled={motion.path === 'none'}
            >
              <Gauge size={16} /> Slow motion
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm font-medium text-ink-600">
              <Rotate3d size={16} aria-hidden />
              Tilt
              <input
                type="range"
                min={-50}
                max={50}
                value={tilt}
                onChange={(e) => setTilt(Number(e.target.value))}
                className="w-28 accent-sky"
                aria-label="Tilt the view"
              />
            </label>
          </div>
          {variant === 'sign' && (
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-sky-50 p-3">
                <dt className="flex items-center gap-2 font-semibold text-navy">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky" /> Start
                </dt>
                <dd className="mt-1 text-ink-600">{motion.start.label}</dd>
              </div>
              <div className="rounded-2xl bg-sun-100 p-3">
                <dt className="flex items-center gap-2 font-semibold text-navy">
                  <span className="h-2.5 w-2.5 rounded-full bg-sun ring-1 ring-navy" /> End
                </dt>
                <dd className="mt-1 text-ink-600">{motion.end.label}</dd>
              </div>
              <div className="rounded-2xl bg-navy-50 p-3">
                <dt className="font-semibold text-navy">Direction</dt>
                <dd className="mt-1 text-ink-600">{motion.direction}</dd>
              </div>
            </dl>
          )}
          <p className="text-xs text-ink-500">
            Front-view schematic. The tilt control only angles the picture; movement toward the viewer is drawn as outward, so
            read the direction note. Compare with a reference video before relying on any detail.
          </p>
        </>
      )}
    </div>
  )
}
