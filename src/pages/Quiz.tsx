import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Gauge } from 'lucide-react'
import { BackLink, Page, PageHeader } from '../components/ui'
import QuestionRunner, { type RunResult } from '../components/QuestionRunner'
import Results from '../components/Results'
import { buildQuiz, type Difficulty } from '../lib/quiz'
import { useProgress } from '../lib/progress'

const LEVELS: { id: Difficulty; title: string; body: string; count: number }[] = [
  { id: 'beginner', title: 'Beginner', body: 'Common letters and everyday greetings. Visual recognition only.', count: 8 },
  { id: 'intermediate', title: 'Intermediate', body: 'Any letter or sign, plus matching descriptions to letters.', count: 10 },
  { id: 'advanced', title: 'Advanced', body: 'Look-alike handshapes and signs identified from written descriptions.', count: 10 },
]

function QuizRun({ difficulty }: { difficulty: Difficulty }) {
  const { saveQuiz } = useProgress()
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [result, setResult] = useState<RunResult | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => buildQuiz(difficulty), [difficulty, round])
  const idx = LEVELS.findIndex((l) => l.id === difficulty)
  const nextLevel = LEVELS[idx + 1]

  const finish = (r: RunResult) => {
    saveQuiz({ mode: 'quiz', difficulty, score: r.score, total: r.total, wrongKeys: r.wrongKeys })
    setResult(r)
  }

  if (result) {
    return (
      <Results
        title={`${LEVELS[idx].title} quiz results`}
        result={result}
        onRetry={() => {
          setResult(null)
          setRound((n) => n + 1)
        }}
        extra={
          nextLevel && result.score / result.total >= 0.7 ? (
            <button className="btn btn-accent" onClick={() => navigate(`/quiz/${nextLevel.id}`)}>
              Try {nextLevel.title} <ArrowRight size={16} aria-hidden />
            </button>
          ) : null
        }
      />
    )
  }
  return (
    <>
      <h1 className="sr-only">{LEVELS[idx].title} quiz</h1>
      <QuestionRunner key={round} questions={questions} onFinish={finish} />
    </>
  )
}

export default function Quiz() {
  const { difficulty } = useParams()
  const valid = LEVELS.find((l) => l.id === difficulty)
  if (difficulty && !valid) return <Navigate to="/quiz" replace />

  return (
    <Page>
      {valid ? (
        <>
          <BackLink to="/quiz">All quizzes</BackLink>
          <QuizRun key={valid.id} difficulty={valid.id} />
        </>
      ) : (
        <>
          <PageHeader eyebrow="Quiz" title="Test what you know">
            Each quiz mixes handshape and sign recognition. You get feedback after every question and a study list at the end.
          </PageHeader>
          <div className="grid gap-5 md:grid-cols-3">
            {LEVELS.map((l, i) => (
              <Link key={l.id} to={`/quiz/${l.id}`} className="card group transition-all hover:-translate-y-1 hover:shadow-lift">
                <span className="flex gap-1 text-sky-600" aria-hidden>
                  {[0, 1, 2].map((n) => (
                    <Gauge key={n} size={18} className={n <= i ? '' : 'opacity-20'} />
                  ))}
                </span>
                <h2 className="mt-4 text-xl font-bold">{l.title}</h2>
                <p className="mt-2 text-sm text-ink-600">{l.body}</p>
                <p className="mt-5 flex items-center gap-1 text-sm font-semibold text-navy">
                  {l.count} questions <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </Page>
  )
}
