import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Check, Info, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      id="main"
      tabIndex={-1}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 ${className}`}
    >
      {children}
    </motion.main>
  )
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 max-w-2xl">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      {children && <p className="mt-3 text-base text-ink-600">{children}</p>}
    </header>
  )
}

export function ProgressRing({ value, size = 120, stroke = 12, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={label ?? `${clamped}% complete`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped / 100) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-2xl font-extrabold text-navy">{clamped}%</span>
    </div>
  )
}

export function ProgressBar({ value, tone = 'bg-sky' }: { value: number; tone?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className={`h-full rounded-full ${tone}`} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-600">
        <SearchX size={26} aria-hidden />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <div className="max-w-md text-sm text-ink-600">{children}</div>}
      {action}
    </div>
  )
}

export function LearnedButton({ learned, onClick }: { learned: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={learned} className={`btn ${learned ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100' : 'btn-accent'}`}>
      <Check size={16} aria-hidden />
      {learned ? 'Learned — tap to undo' : 'I Learned This Sign'}
    </button>
  )
}

export function AccuracyNote({ complex, partial }: { complex?: boolean; partial?: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-sun-100/70 p-4 text-sm text-ink" role="note">
      <Info size={18} className="mt-0.5 shrink-0 text-sun-600" aria-hidden />
      <p>
        <strong className="text-navy">Check against a reference.</strong>{' '}
        {complex ? 'This is a subtle handshape and the drawing is simplified. ' : 'The drawing is a simplified schematic. '}
        {partial ? `${partial} ` : ''}
        Confirm the details on{' '}
        <a href="https://www.lifeprint.com/" target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline">
          ASL University
        </a>{' '}
        or with a Deaf instructor.
      </p>
    </div>
  )
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">
      ← {children}
    </Link>
  )
}
