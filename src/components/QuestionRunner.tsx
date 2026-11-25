import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, Eye, X } from 'lucide-react'
import HandSVG from './HandSVG'
import SignDemo from './SignDemo'
import { ProgressBar } from './ui'
import { vocabById } from '../data/vocabulary'
import { useProgress } from '../lib/progress'
import type { Question } from '../lib/quiz'

export interface RunResult {
  score: number
  total: number
  wrongKeys: string[]
}

interface Props {
  questions: Question[]
  onFinish: (r: RunResult) => void
  /** hide the visual after a few seconds so it must be remembered */
  memory?: boolean
}

const MEMORY_MS = 3500

function Visual({ q, hidden }: { q: Question; hidden: boolean }) {
  const v = q.visual
  if (hidden) {
    return (
      <div className="grid h-64 place-items-center rounded-3xl bg-navy-50 text-center text-navy">
        <div>
          <Eye size={28} className="mx-auto mb-2" aria-hidden />
          <p className="font-semibold">Hidden. What did you see?</p>
        </div>
      </div>
    )
  }
  if (v.type === 'hand') {
    return (
      <div className="grid place-items-center rounded-3xl bg-gradient-to-b from-sky-50 to-white p-6 ring-1 ring-navy/5">
        <HandSVG shape={v.shape} label={v.label} className="h-64" />
      </div>
    )
  }
  if (v.type === 'sign') {
    const entry = vocabById(v.id)!
    return <SignDemo key={q.id} motion={entry.motion} label="Schematic ASL sign demonstration. Choose the matching word." compact quiet />
  }
  return (
    <div className="grid min-h-[16rem] place-items-center rounded-3xl bg-gradient-to-b from-sky-50 to-white p-8 text-center ring-1 ring-navy/5">
      <p className="max-w-md text-lg font-medium text-navy">{v.text}</p>
    </div>
  )
}

export default function QuestionRunner({ questions, onFinish, memory = false }: Props) {
  const { recordAnswer } = useProgress()
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const wrong = useRef<string[]>([])
  const score = useRef(0)

  const q = questions[i]
  const answered = picked !== null
  const letters = useMemo(() => ['A', 'B', 'C', 'D'], [])

  useEffect(() => {
    setPicked(null)
    setHidden(false)
    if (!memory) return
    const t = setTimeout(() => setHidden(true), MEMORY_MS)
    return () => clearTimeout(t)
  }, [i, memory])

  const choose = useCallback(
    (id: string) => {
      if (picked !== null || !q) return
      setPicked(id)
      setHidden(false)
      const ok = id === q.correctId
      if (ok) score.current += 1
      else wrong.current.push(q.key)
      recordAnswer(q.key, ok)
    },
    [picked, q, recordAnswer],
  )

  const advance = useCallback(() => {
    if (i + 1 >= questions.length) {
      onFinish({ score: score.current, total: questions.length, wrongKeys: [...new Set(wrong.current)] })
    } else {
      setI((n) => n + 1)
    }
  }, [i, questions.length, onFinish])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q) return
      if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
        const opt = q.options[Number(e.key) - 1]
        if (opt) choose(opt.id)
      } else if (answered && e.key === 'Enter') {
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, answered, choose, advance])

  if (!q) return null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm font-semibold text-navy" aria-live="polite">
          Question {i + 1} of {questions.length}
        </span>
        <div className="flex-1">
          <ProgressBar value={((i + (answered ? 1 : 0)) / questions.length) * 100} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
          <h2 className="mb-4 text-2xl font-extrabold">{q.prompt}</h2>
          <Visual q={q} hidden={hidden && !answered} />
          {memory && !answered && !hidden && <p className="mt-2 text-center text-sm text-ink-500">Memorize it. It disappears in a few seconds.</p>}

          <div role="group" aria-label="Answers" className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.options.map((o, idx) => {
              const isCorrect = o.id === q.correctId
              const isPicked = picked === o.id
              const tone = !answered
                ? 'bg-white text-navy ring-1 ring-navy/10 hover:-translate-y-0.5 hover:bg-sky-50 hover:ring-sky/40'
                : isCorrect
                  ? 'bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400'
                  : isPicked
                    ? 'bg-red-50 text-red-900 ring-2 ring-red-300'
                    : 'bg-white text-ink-500 ring-1 ring-navy/5 opacity-70'
              return (
                <button key={o.id} disabled={answered} onClick={() => choose(o.id)} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left font-semibold shadow-card transition-all ${tone}`}>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-navy/5 text-xs font-bold">{letters[idx]}</span>
                  <span className="flex-1">{o.label}</span>
                  {answered && isCorrect && <Check size={18} aria-label="Correct answer" />}
                  {answered && isPicked && !isCorrect && <X size={18} aria-label="Your answer, incorrect" />}
                </button>
              )
            })}
          </div>

          {answered && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status" className={`mt-6 rounded-3xl p-5 ${picked === q.correctId ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-red-50 ring-1 ring-red-200'}`}>
              <p className={`font-bold ${picked === q.correctId ? 'text-emerald-900' : 'text-red-900'}`}>{picked === q.correctId ? 'Correct!' : 'Not quite.'}</p>
              <p className="mt-1 text-sm text-ink">{q.explanation}</p>
              <button className="btn btn-primary mt-4" onClick={advance} autoFocus>
                {i + 1 >= questions.length ? 'See results' : 'Next question'} <ArrowRight size={16} aria-hidden />
              </button>
            </motion.div>
          )}
          {!answered && <p className="mt-4 text-center text-xs text-ink-500">Tip: press 1–4 to answer, Enter to continue.</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
