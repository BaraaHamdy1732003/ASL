import { Link } from 'react-router-dom'
import { ArrowRight, BookA, Flame, Hash, MessageSquareText, Target, Trophy } from 'lucide-react'
import { Page, PageHeader, ProgressBar, ProgressRing } from '../components/ui'
import HandSVG from '../components/HandSVG'
import { letterByChar } from '../data/alphabet'
import { vocabById } from '../data/vocabulary'
import { LESSONS, lessonDone, lessonProgress, levelFor, parseKey } from '../lib/lessons'
import { useProgress } from '../lib/progress'

export default function Dashboard() {
  const { state, streak, todayCount, learnedCount, percent, lessonsDone, setDailyGoal } = useProgress()
  const level = levelFor(learnedCount)
  const next = LESSONS.find((l) => !lessonDone(l, state.learned))
  const recommended = LESSONS.filter((l) => !lessonDone(l, state.learned) && l.id !== next?.id).slice(0, 3)
  const goalPct = Math.min(100, Math.round((todayCount / state.dailyGoal) * 100))
  const hasStarted = learnedCount > 0

  const stats = [
    { icon: Trophy, label: 'Level', value: level.current.name, tone: 'bg-sun-100' },
    { icon: Flame, label: 'Day streak', value: `${streak}`, tone: 'bg-sky-50' },
    { icon: BookA, label: 'Lessons completed', value: `${lessonsDone}/${LESSONS.length}`, tone: 'bg-navy-50' },
  ]

  return (
    <Page>
      <PageHeader eyebrow="Your learning" title={hasStarted ? 'Welcome back!' : 'Welcome to Signify'}>
        {hasStarted
          ? `You have learned ${learnedCount} signs so far.${level.next ? ` ${level.toNext} more to reach ${level.next.name}.` : ' You are at the top level.'}`
          : 'Pick a path below. Most beginners start with the alphabet.'}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card flex items-center gap-6 lg:row-span-2" aria-labelledby="overall">
          <ProgressRing value={percent} size={132} label={`${percent}% of all signs learned`} />
          <div>
            <h2 id="overall" className="text-lg font-bold">
              Overall progress
            </h2>
            <p className="mt-1 text-sm text-ink-600">{learnedCount} signs learned</p>
            <Link to="/progress" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">
              Full progress <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </section>

        {stats.map((s) => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.tone}`}>
            <s.icon size={20} className="text-navy" aria-hidden />
            <p className="mt-3 text-2xl font-extrabold text-navy">{s.value}</p>
            <p className="text-sm text-ink-600">{s.label}</p>
          </div>
        ))}

        <section className="card lg:col-span-2" aria-labelledby="goal">
          <div className="flex items-center justify-between gap-4">
            <h2 id="goal" className="flex items-center gap-2 text-lg font-bold">
              <Target size={18} className="text-sky-600" aria-hidden /> Daily goal
            </h2>
            <label className="flex items-center gap-2 text-sm text-ink-600">
              Goal
              <select
                value={state.dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="rounded-xl border-0 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-navy ring-1 ring-navy/10"
              >
                {[1, 3, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'activity' : 'activities'}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-sm text-ink-600">
            {todayCount >= state.dailyGoal ? 'Goal reached today. Nice work!' : `${todayCount} of ${state.dailyGoal} done today. Learning a sign or answering a question counts.`}
          </p>
          <div className="mt-3">
            <ProgressBar value={goalPct} tone="bg-sun" />
          </div>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="paths">
        <h2 id="paths" className="mb-4 text-xl font-bold">
          Choose what to learn
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { to: '/learn/alphabet', icon: BookA, title: 'ASL Alphabet', body: 'All 26 letters with handshape guides.', letter: 'A' },
            { to: '/learn/vocabulary', icon: MessageSquareText, title: 'Vocabulary', body: 'Greetings, family, emotions, food and more.', letter: 'B' },
            { to: '/learn/numbers', icon: Hash, title: 'Numbers', body: 'Counting from zero, and how it works.', letter: 'L' },
          ].map((p) => (
            <Link key={p.to} to={p.to} className="card group flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy text-sun">
                <p.icon size={24} aria-hidden />
              </span>
              <span>
                <span className="block font-bold text-navy">{p.title}</span>
                <span className="text-sm text-ink-600">{p.body}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {next && (
        <section className="mt-10" aria-labelledby="continue">
          <h2 id="continue" className="mb-4 text-xl font-bold">
            Continue learning
          </h2>
          <Link to={next.to} className="card group flex flex-wrap items-center justify-between gap-4 transition-all hover:shadow-lift">
            <div className="min-w-[14rem] flex-1">
              <span className="chip bg-sky-50 text-sky-700">{next.group}</span>
              <h3 className="mt-3 text-xl font-bold">{next.title}</h3>
              <p className="text-sm text-ink-600">{next.blurb}</p>
              <div className="mt-4 max-w-sm">
                <ProgressBar value={(lessonProgress(next, state.learned) / next.keys.length) * 100} />
                <p className="mt-1 text-xs text-ink-500">
                  {lessonProgress(next, state.learned)} of {next.keys.length} learned
                </p>
              </div>
            </div>
            <span className="btn btn-primary">
              {lessonProgress(next, state.learned) ? 'Resume' : 'Start'} <ArrowRight size={16} aria-hidden />
            </span>
          </Link>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="mt-10" aria-labelledby="recommended">
          <h2 id="recommended" className="mb-4 text-xl font-bold">
            Recommended lessons
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {recommended.map((l) => (
              <Link key={l.id} to={l.to} className="card transition-all hover:-translate-y-1 hover:shadow-lift">
                <span className="chip bg-sun-100 text-navy">{l.group}</span>
                <h3 className="mt-3 font-bold">{l.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{l.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="recent">
        <h2 id="recent" className="mb-4 text-xl font-bold">
          Recently learned signs
        </h2>
        {state.recent.length === 0 ? (
          <div className="card text-sm text-ink-600">
            Nothing here yet. Open a letter or a sign and press “I Learned This Sign” to see it here.
          </div>
        ) : (
          <ul className="flex gap-4 overflow-x-auto pb-2">
            {state.recent.slice(0, 8).map((r) => {
              const { kind, id } = parseKey(r.key)
              const letter = kind === 'letter' ? letterByChar(id) : undefined
              const sign = kind === 'sign' ? vocabById(id) : undefined
              if (!letter && !sign) return null
              return (
                <li key={r.key} className="shrink-0">
                  <Link to={letter ? `/learn/alphabet/${letter.letter}` : `/learn/sign/${id}`} className="card flex w-36 flex-col items-center !p-4 hover:shadow-lift">
                    {letter ? (
                      <HandSVG shape={letter.shape} label={`Letter ${letter.letter}`} className="h-24" />
                    ) : (
                      <span className="grid h-24 place-items-center text-3xl" aria-hidden>
                        🤟
                      </span>
                    )}
                    <span className="mt-1 font-bold text-navy">{letter ? `Letter ${letter.letter}` : sign!.word}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </Page>
  )
}
