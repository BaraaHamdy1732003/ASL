import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, Search, X } from 'lucide-react'
import { BackLink, EmptyState, Page, PageHeader, ProgressBar } from '../components/ui'
import HandSVG from '../components/HandSVG'
import { CATEGORIES, VOCAB, categoryById } from '../data/vocabulary'
import { itemKey } from '../lib/lessons'
import { useProgress } from '../lib/progress'
import type { CategoryId } from '../types'

export default function Vocabulary() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { isLearned } = useProgress()
  const [q, setQ] = useState('')
  const active = CATEGORIES.find((c) => c.id === category)?.id as CategoryId | undefined

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return VOCAB.filter((v) => (!active || v.category === active) && (!needle || v.word.toLowerCase().includes(needle)))
  }, [q, active])

  const scope = active ? VOCAB.filter((v) => v.category === active) : VOCAB
  const learned = scope.filter((v) => isLearned(itemKey('sign', v.id))).length

  return (
    <Page>
      <BackLink to="/learn">Learn</BackLink>
      <PageHeader eyebrow="Vocabulary" title={active ? categoryById(active).name : 'Vocabulary library'}>
        {active
          ? categoryById(active).blurb
          : 'ASL signs grouped by topic. Each sign shows the handshape, movement and facial expression, and when to use it.'}
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Categories">
        <button role="tab" aria-selected={!active} onClick={() => navigate('/learn/vocabulary')} className={`chip !px-4 !py-2 ${!active ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-navy/10 hover:bg-sky-50'}`}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={active === c.id}
            onClick={() => navigate(`/learn/vocabulary/${c.id}`)}
            className={`chip !px-4 !py-2 ${active === c.id ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-navy/10 hover:bg-sky-50'}`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className="mb-8 grid items-center gap-4 md:grid-cols-[1fr_16rem]">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden />
          <input className="input !pl-11 !pr-10" type="search" placeholder="Search signs…" aria-label="Search vocabulary" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-500 hover:bg-slate-100">
              <X size={16} />
            </button>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-navy">
            {learned} of {scope.length} learned
          </p>
          <div className="mt-1.5">
            <ProgressBar value={scope.length ? (learned / scope.length) * 100 : 0} />
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={`No signs match “${q}”`}
          action={
            <button className="btn btn-ghost" onClick={() => setQ('')}>
              Clear search
            </button>
          }
        >
          Try a shorter word, or open the Dictionary to see how to fingerspell it.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => {
            const done = isLearned(itemKey('sign', v.id))
            const c = categoryById(v.category)
            return (
              <li key={v.id}>
                <Link to={`/learn/sign/${v.id}`} className="card group flex h-full items-center gap-4 !p-4 transition-all hover:-translate-y-1 hover:shadow-lift">
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-sky-50">
                    <HandSVG shape={v.motion.start.shape} label={`Starting handshape for ${v.word}`} className="h-16" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-bold text-navy">{v.word}</span>
                    <span className={`chip mt-1 ${c.tone}`}>{c.name}</span>
                  </span>
                  {done && (
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white" title="Learned">
                      <Check size={15} aria-label="Learned" />
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Page>
  )
}
