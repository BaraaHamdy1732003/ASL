import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { ProgressRing } from './ui'
import { LESSONS, parseKey } from '../lib/lessons'
import { letterByChar } from '../data/alphabet'
import { vocabById } from '../data/vocabulary'
import type { ReactNode } from 'react'
import type { RunResult } from './QuestionRunner'

function recommendation(pct: number) {
  if (pct >= 90) return 'Excellent. You are ready for a harder challenge.'
  if (pct >= 70) return 'Good work. Review the items below and try again.'
  if (pct >= 40) return 'You are getting there. Revisit the lessons below, then retry.'
  return 'Take it slowly. Go back to the lessons below and try the quiz again afterwards.'
}

export default function Results({ result, onRetry, extra, title = 'Results' }: { result: RunResult; onRetry: () => void; extra?: ReactNode; title?: string }) {
  const pct = result.total ? Math.round((result.score / result.total) * 100) : 0
  const study = result.wrongKeys.map((k) => {
    const { kind, id } = parseKey(k)
    if (kind === 'letter') {
      const lesson = LESSONS.find((l) => l.keys.includes(k))
      return { k, label: `Letter ${id}`, to: `/learn/alphabet/${letterByChar(id)?.letter ?? 'A'}`, group: lesson?.title }
    }
    const v = vocabById(id)
    return { k, label: v?.word ?? id, to: `/learn/sign/${id}`, group: LESSONS.find((l) => l.keys.includes(k))?.title }
  })

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <div className="mt-6 flex justify-center">
        <ProgressRing value={pct} size={160} stroke={14} label={`Score ${pct} percent`} />
      </div>
      <p className="mt-4 text-xl font-bold text-navy">
        {result.score} of {result.total} correct
      </p>
      <p className="mt-1 text-ink-600">{recommendation(pct)}</p>

      {study.length > 0 && (
        <section className="card mt-8 text-left" aria-labelledby="study">
          <h2 id="study" className="text-lg font-bold">
            Study next
          </h2>
          <p className="mt-1 text-sm text-ink-600">You missed these. Open each one to review the sign.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {study.map((s) => (
              <li key={s.k}>
                <Link to={s.to} className="chip bg-sky-50 !px-3.5 !py-2 text-navy hover:bg-sky-100">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn btn-primary" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden /> Try again
        </button>
        <Link to="/progress" className="btn btn-ghost">
          View progress <ArrowRight size={16} aria-hidden />
        </Link>
        {extra}
      </div>
    </motion.div>
  )
}
