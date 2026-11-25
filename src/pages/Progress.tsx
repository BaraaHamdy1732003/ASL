import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, BookCheck, Flame, GraduationCap, Lock, Trash2 } from 'lucide-react'
import { EmptyState, Page, PageHeader, ProgressBar, ProgressRing } from '../components/ui'
import { letterByChar } from '../data/alphabet'
import { VOCAB, vocabById } from '../data/vocabulary'
import { ALL_KEYS, LESSONS, lessonProgress, parseKey } from '../lib/lessons'
import { dayKey, useProgress } from '../lib/progress'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Progress() {
  const { state, streak, learnedCount, lessonsDone, percent, badges, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { label: DAYS[d.getDay()], count: state.activity[dayKey(d)] ?? 0, today: i === 6 }
  })
  const maxDay = Math.max(1, ...week.map((w) => w.count))
  const quizzes = state.quizzes.slice(-8)
  const avg = state.quizzes.length ? Math.round((state.quizzes.reduce((s, q) => s + q.score / q.total, 0) / state.quizzes.length) * 100) : null

  const weak = Object.entries(state.mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, count]) => {
      const { kind, id } = parseKey(key)
      const label = kind === 'letter' ? `Letter ${id}` : (vocabById(id)?.word ?? id)
      const to = kind === 'letter' ? `/learn/alphabet/${letterByChar(id)?.letter ?? 'A'}` : `/learn/sign/${id}`
      return { key, label, count, to }
    })

  const stats = [
    { icon: BookCheck, label: 'Signs learned', value: `${learnedCount}/${ALL_KEYS.length}` },
    { icon: GraduationCap, label: 'Lessons completed', value: `${lessonsDone}/${LESSONS.length}` },
    { icon: Flame, label: 'Day streak', value: `${streak}` },
    { icon: Award, label: 'Average quiz score', value: avg === null ? '–' : `${avg}%` },
  ]

  return (
    <Page>
      <PageHeader eyebrow="Progress" title="Your learning journey">
        Everything is saved in this browser. Clearing site data will reset it.
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <s.icon size={20} className="text-sky-600" aria-hidden />
            <p className="mt-3 text-3xl font-extrabold text-navy">{s.value}</p>
            <p className="text-sm text-ink-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2" aria-labelledby="activity">
          <h2 id="activity" className="text-lg font-bold">
            Daily activity
          </h2>
          <p className="text-sm text-ink-600">Signs learned and questions answered, last 7 days.</p>
          <ul className="mt-6 flex h-44 items-end gap-3">
            {week.map((w) => (
              <li key={w.label + w.today} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-navy">{w.count}</span>
                <div className="flex h-28 w-full items-end rounded-xl bg-slate-100">
                  <div
                    className={`w-full rounded-xl ${w.today ? 'bg-sun' : 'bg-sky'}`}
                    style={{ height: `${(w.count / maxDay) * 100}%`, minHeight: w.count ? 8 : 0 }}
                    role="img"
                    aria-label={`${w.label}: ${w.count} activities`}
                  />
                </div>
                <span className={`text-xs ${w.today ? 'font-bold text-navy' : 'text-ink-500'}`}>{w.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card flex flex-col items-center text-center" aria-labelledby="overall">
          <h2 id="overall" className="self-start text-lg font-bold">
            Overall
          </h2>
          <div className="my-4">
            <ProgressRing value={percent} size={150} label={`${percent}% of all signs learned`} />
          </div>
          <p className="text-sm text-ink-600">{learnedCount} of {ALL_KEYS.length} signs learned</p>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="lessons">
          <h2 id="lessons" className="mb-4 text-lg font-bold">
            Lessons
          </h2>
          <ul className="space-y-4">
            {LESSONS.map((l) => {
              const done = lessonProgress(l, state.learned)
              return (
                <li key={l.id}>
                  <Link to={l.to} className="group block">
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-navy group-hover:underline">{l.title}</span>
                      <span className="text-ink-500">
                        {done}/{l.keys.length}
                      </span>
                    </div>
                    <ProgressBar value={(done / l.keys.length) * 100} tone={done === l.keys.length ? 'bg-emerald-500' : 'bg-sky'} />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="card" aria-labelledby="quizzes">
            <h2 id="quizzes" className="mb-4 text-lg font-bold">
              Quiz scores
            </h2>
            {quizzes.length === 0 ? (
              <p className="text-sm text-ink-600">
                No quizzes yet. <Link to="/quiz" className="font-semibold text-sky-700 underline">Take your first one</Link>.
              </p>
            ) : (
              <ul className="space-y-3">
                {quizzes.map((q) => {
                  const pct = Math.round((q.score / q.total) * 100)
                  return (
                    <li key={q.id} className="flex items-center gap-3 text-sm">
                      <span className="w-28 shrink-0 capitalize text-ink-600">{q.difficulty ?? q.mode}</span>
                      <div className="flex-1">
                        <ProgressBar value={pct} tone={pct >= 70 ? 'bg-emerald-500' : 'bg-sun'} />
                      </div>
                      <span className="w-12 text-right font-bold text-navy">{pct}%</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="card" aria-labelledby="weak">
            <h2 id="weak" className="mb-1 text-lg font-bold">
              Weak areas
            </h2>
            <p className="mb-4 text-sm text-ink-600">Signs you answered incorrectly most recently.</p>
            {weak.length === 0 ? (
              <p className="text-sm text-ink-600">No weak spots right now.</p>
            ) : (
              <>
                <ul className="flex flex-wrap gap-2">
                  {weak.map((w) => (
                    <li key={w.key}>
                      <Link to={w.to} className="chip bg-red-50 !px-3 !py-1.5 text-red-900 hover:bg-red-100">
                        {w.label} · missed {w.count}×
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to="/practice/review" className="btn btn-primary mt-4">
                  Review mistakes
                </Link>
              </>
            )}
          </section>
        </div>
      </div>

      <section className="mt-6" aria-labelledby="badges">
        <h2 id="badges" className="mb-4 text-lg font-bold">
          Achievement badges
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <li key={b.id} className={`card flex items-start gap-3 !p-5 ${b.earned ? '' : 'opacity-60'}`}>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${b.earned ? 'bg-sun text-navy' : 'bg-slate-100 text-ink-500'}`}>
                {b.earned ? <Award size={20} aria-hidden /> : <Lock size={18} aria-hidden />}
              </span>
              <div>
                <p className="font-bold text-navy">{b.name}</p>
                <p className="text-xs text-ink-600">{b.description}</p>
                <p className="sr-only">{b.earned ? 'Earned' : 'Locked'}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {VOCAB.length > 0 && learnedCount === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Your journey starts here"
            action={
              <Link to="/learn/alphabet/A" className="btn btn-primary">
                Learn the letter A
              </Link>
            }
          >
            Learn a sign and your charts will fill in.
          </EmptyState>
        </div>
      )}

      <div className="mt-10 flex justify-end">
        {confirming ? (
          <div className="flex items-center gap-3 text-sm" role="alertdialog" aria-label="Confirm reset">
            <span className="text-ink-600">Erase all saved progress?</span>
            <button
              className="btn bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                reset()
                setConfirming(false)
              }}
            >
              Yes, reset
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => setConfirming(true)}>
            <Trash2 size={16} aria-hidden /> Reset progress
          </button>
        )}
      </div>
    </Page>
  )
}
