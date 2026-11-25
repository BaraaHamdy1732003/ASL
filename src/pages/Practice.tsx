import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Camera, Check, Eye, ListChecks, Puzzle, RotateCcw, Shuffle } from 'lucide-react'
import { BackLink, EmptyState, Page, PageHeader } from '../components/ui'
import QuestionRunner, { type RunResult } from '../components/QuestionRunner'
import Results from '../components/Results'
import SignDemo from '../components/SignDemo'
import { VOCAB } from '../data/vocabulary'
import { buildPractice, buildReview, shuffle } from '../lib/quiz'
import { itemKey } from '../lib/lessons'
import { useProgress } from '../lib/progress'

type Mode = 'recognition' | 'multiple-choice' | 'matching' | 'memory' | 'review'

const MODES: { id: Mode; title: string; body: string; icon: typeof Eye }[] = [
  { id: 'recognition', title: 'Visual recognition', body: 'See a handshape or sign and name it.', icon: Eye },
  { id: 'multiple-choice', title: 'Multiple choice', body: 'Read a description and pick the right answer from four.', icon: ListChecks },
  { id: 'matching', title: 'Gesture matching', body: 'Match English words to their ASL demonstrations.', icon: Puzzle },
  { id: 'memory', title: 'Memory challenge', body: 'A sign shows briefly, then disappears. Can you recall it?', icon: Brain },
  { id: 'review', title: 'Review mistakes', body: 'Repeat the questions you answered incorrectly.', icon: Shuffle },
]

function Matching({ onDone }: { onDone: (r: RunResult) => void }) {
  const { recordAnswer } = useProgress()
  const pairs = useMemo(() => shuffle(VOCAB.filter((v) => v.motion.path !== 'none')).slice(0, 5), [])
  const demos = useMemo(() => shuffle(pairs), [pairs])
  const [word, setWord] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrongFlash, setWrongFlash] = useState<string | null>(null)
  const [wrongKeys, setWrongKeys] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)

  const pickDemo = (id: string) => {
    if (!word || matched.includes(id)) return
    setAttempts((n) => n + 1)
    const ok = word === id
    recordAnswer(itemKey('sign', word), ok)
    if (ok) {
      const next = [...matched, id]
      setMatched(next)
      setWord(null)
      if (next.length === pairs.length) {
        const unique = [...new Set(wrongKeys)]
        setTimeout(() => onDone({ score: pairs.length - unique.length, total: pairs.length, wrongKeys: unique }), 700)
      }
    } else {
      setWrongKeys((k) => [...k, itemKey('sign', word)])
      setWrongFlash(id)
      setTimeout(() => setWrongFlash(null), 600)
    }
  }

  return (
    <div>
      <p className="mb-6 text-center text-ink-600" aria-live="polite">
        {word ? 'Now choose the demonstration that matches the word.' : 'Choose a word, then the demonstration that matches it.'} Attempts: {attempts}
      </p>
      <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
        <ul className="space-y-3">
          {pairs.map((p) => {
            const done = matched.includes(p.id)
            return (
              <li key={p.id}>
                <button
                  disabled={done}
                  onClick={() => setWord(p.id)}
                  aria-pressed={word === p.id}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left font-semibold shadow-card transition-all ${done ? 'bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300' : word === p.id ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-navy/10 hover:bg-sky-50'}`}
                >
                  {p.word} {done && <Check size={16} aria-label="Matched" />}
                </button>
              </li>
            )
          })}
        </ul>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((d, i) => {
            const done = matched.includes(d.id)
            return (
              <li key={d.id}>
                <motion.button
                  animate={wrongFlash === d.id ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                  disabled={done || !word}
                  onClick={() => pickDemo(d.id)}
                  aria-label={`Demonstration ${i + 1}${done ? ', matched' : ''}`}
                  className={`w-full overflow-hidden rounded-3xl bg-white p-2 text-left shadow-card transition-all ${done ? 'ring-2 ring-emerald-300' : wrongFlash === d.id ? 'ring-2 ring-red-300' : 'ring-1 ring-navy/10 enabled:hover:ring-sky'} disabled:cursor-default`}
                >
                  <SignDemo motion={d.motion} label={`Schematic demonstration ${i + 1}`} compact quiet />
                </motion.button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function Session({ mode }: { mode: Exclude<Mode, 'matching'> | 'matching' }) {
  const { state } = useProgress()
  const [round, setRound] = useState(0)
  const [result, setResult] = useState<RunResult | null>(null)
  const mistakeKeys = Object.keys(state.mistakes)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => (mode === 'review' ? buildReview(mistakeKeys) : mode === 'matching' ? [] : buildPractice(mode)), [mode, round])

  const retry = () => {
    setResult(null)
    setRound((n) => n + 1)
  }

  if (mode === 'review' && questions.length === 0 && !result) {
    return (
      <EmptyState
        title="No mistakes to review"
        action={
          <Link to="/practice" className="btn btn-primary">
            Back to practice
          </Link>
        }
      >
        Nice. Anything you answer incorrectly in a practice session or quiz will show up here until you get it right.
      </EmptyState>
    )
  }
  if (result) return <Results title="Practice complete" result={result} onRetry={retry} />
  if (mode === 'matching') return <Matching key={round} onDone={setResult} />
  return <QuestionRunner key={round} questions={questions} onFinish={setResult} memory={mode === 'memory'} />
}

export default function Practice() {
  const { mode } = useParams()
  const active = MODES.find((m) => m.id === mode)
  const { state } = useProgress()
  const mistakes = Object.keys(state.mistakes).length
  if (mode && !active) return <Navigate to="/practice" replace />

  return (
    <Page>
      {active ? (
        <>
          <BackLink to="/practice">All practice modes</BackLink>
          <h1 className="mb-6 text-center text-3xl font-extrabold">{active.title}</h1>
          <Session key={active.id} mode={active.id} />
        </>
      ) : (
        <>
          <PageHeader eyebrow="Practice" title="Build it into muscle memory">
            Short sessions with instant feedback. Every wrong answer is saved so you can review it later.
          </PageHeader>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((m) => (
              <Link key={m.id} to={`/practice/${m.id}`} className="card group transition-all hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-sun">
                  <m.icon size={22} aria-hidden />
                </span>
                <h2 className="mt-4 text-lg font-bold">{m.title}</h2>
                <p className="mt-1 text-sm text-ink-600">{m.body}</p>
                {m.id === 'review' && (
                  <span className="chip mt-3 bg-sun-100 text-navy">
                    <RotateCcw size={12} aria-hidden /> {mistakes} to review
                  </span>
                )}
              </Link>
            ))}
            <Link to="/practice/camera" className="card group transition-all hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                <Camera size={22} aria-hidden />
              </span>
              <h2 className="mt-4 text-lg font-bold">Camera coach</h2>
              <p className="mt-1 text-sm text-ink-600">Practice ASL fingerspelling with local hand and face framing feedback.</p>
            </Link>
            <Link to="/quiz" className="card flex flex-col justify-center bg-navy !text-white transition-all hover:-translate-y-1 hover:shadow-lift">
              <h2 className="text-lg font-bold !text-white">Ready for a quiz?</h2>
              <p className="mt-1 text-sm text-blue-100">Beginner, intermediate and advanced levels with a results screen.</p>
            </Link>
          </div>
        </>
      )}
    </Page>
  )
}
