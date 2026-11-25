import { useEffect, useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Camera, Dumbbell, ExternalLink, Sparkles, TriangleAlert } from 'lucide-react'
import { AccuracyNote, BackLink, LearnedButton, Page, ProgressBar } from '../components/ui'
import SignDemo from '../components/SignDemo'
import HandSVG from '../components/HandSVG'
import { ALPHABET, letterByChar } from '../data/alphabet'
import { motionForLetter } from '../lib/motion'
import { itemKey } from '../lib/lessons'
import { useProgress } from '../lib/progress'

export default function LetterDetail() {
  const { letter = '' } = useParams()
  const navigate = useNavigate()
  const { isLearned, toggleLearned } = useProgress()
  const entry = letterByChar(letter)
  const idx = entry ? ALPHABET.indexOf(entry) : -1
  const prev = idx > 0 ? ALPHABET[idx - 1] : null
  const next = idx >= 0 && idx < ALPHABET.length - 1 ? ALPHABET[idx + 1] : null
  const motion = useMemo(() => (entry ? motionForLetter(entry) : null), [entry])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowLeft' && prev) navigate(`/learn/alphabet/${prev.letter}`)
      if (e.key === 'ArrowRight' && next) navigate(`/learn/alphabet/${next.letter}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, navigate])

  if (!entry || !motion) return <Navigate to="/learn/alphabet" replace />

  const key = itemKey('letter', entry.letter)
  const learned = isLearned(key)
  const learnedCount = ALPHABET.filter((a) => isLearned(itemKey('letter', a.letter))).length

  return (
    <Page>
      <BackLink to="/learn/alphabet">All letters</BackLink>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-5xl font-extrabold">
              <span className="sr-only">Letter </span>
              {entry.letter}
            </h1>
            <span className="chip bg-sky-50 text-sky-700">
              {idx + 1} / {ALPHABET.length}
            </span>
          </div>
          <SignDemo key={entry.letter} motion={motion} label={`ASL handshape for the letter ${entry.letter}: ${entry.handshape}`} variant="letter" />
        </div>

        <div className="space-y-6">
          <section className="card">
            <p className="eyebrow">Handshape</p>
            <h2 className="mt-1 text-xl font-bold">{entry.handshape}</h2>
            <p className="mt-2 text-ink-600">{entry.summary}</p>
            {entry.motion && (
              <p className="mt-3 rounded-2xl bg-sun-100 p-3 text-sm font-medium text-navy">
                This letter includes movement. Press Play to watch the path.
              </p>
            )}
            <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-navy">How to form it</h3>
            <ol className="mt-3 space-y-3">
              {entry.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h3 className="flex items-center gap-2 font-bold text-navy">
              <TriangleAlert size={18} className="text-sun-600" aria-hidden /> Common mistakes
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-600">
              {entry.mistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            {entry.similarTo.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Easily confused with</p>
                <div className="mt-2 flex gap-3 overflow-x-auto">
                  {entry.similarTo
                    .map((c) => letterByChar(c))
                    .filter((x): x is NonNullable<typeof x> => Boolean(x))
                    .map((s) => (
                      <Link key={s.letter} to={`/learn/alphabet/${s.letter}`} className="flex w-20 shrink-0 flex-col items-center rounded-2xl bg-sky-50 p-2 hover:bg-sky-100">
                        <HandSVG shape={s.shape} label={`Handshape for ${s.letter}`} className="h-16" />
                        <span className="text-sm font-bold text-navy">{s.letter}</span>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </section>

          <AccuracyNote complex={entry.fidelity === 'complex'} />
          <a href="https://www.lifeprint.com/asl101/fingerspelling/abc.htm" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">
            Reference chart on ASL University <ExternalLink size={14} aria-hidden />
          </a>

          <div className="flex flex-wrap items-center gap-3">
            <LearnedButton learned={learned} onClick={() => toggleLearned(key)} />
            <Link to="/practice/recognition" className="btn btn-ghost">
              <Dumbbell size={16} aria-hidden /> Practice
            </Link>
            <Link to={`/practice/camera?letter=${entry.letter}`} className="btn btn-ghost">
              <Camera size={16} aria-hidden /> Practice with camera
            </Link>
          </div>

          {learned && (
            <div role="status" className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
              <p className="flex items-center gap-2 font-bold text-emerald-900">
                <Sparkles size={18} aria-hidden /> Progress saved
              </p>
              <p className="mt-1 text-sm text-emerald-900/80">
                {learnedCount} of {ALPHABET.length} letters learned.
              </p>
              <div className="mt-3">
                <ProgressBar value={(learnedCount / ALPHABET.length) * 100} tone="bg-emerald-500" />
              </div>
              <Link to="/quiz/beginner" className="btn btn-primary mt-4">
                Take a short quiz <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>

      <nav aria-label="Letter navigation" className="mt-10 flex items-center justify-between">
        {prev ? (
          <Link to={`/learn/alphabet/${prev.letter}`} className="btn btn-ghost">
            <ArrowLeft size={16} aria-hidden /> Previous: {prev.letter}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/learn/alphabet/${next.letter}`} className="btn btn-primary">
            Next: {next.letter} <ArrowRight size={16} aria-hidden />
          </Link>
        ) : (
          <Link to="/quiz/beginner" className="btn btn-accent">
            Finish with a quiz <ArrowRight size={16} aria-hidden />
          </Link>
        )}
      </nav>
      <p className="mt-3 text-center text-xs text-ink-500">Tip: use the left and right arrow keys to move between letters.</p>
    </Page>
  )
}
