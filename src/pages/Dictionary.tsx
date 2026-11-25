import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { EmptyState, Page, PageHeader } from '../components/ui'
import SignPanel from '../components/SignPanel'
import HandSVG from '../components/HandSVG'
import { letterByChar } from '../data/alphabet'
import { CATEGORIES, VOCAB } from '../data/vocabulary'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function Dictionary() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const cat = params.get('cat') ?? ''
  const az = params.get('az') ?? ''
  const selectedId = params.get('sign') ?? ''

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return VOCAB.filter(
      (v) =>
        (!cat || v.category === cat) &&
        (!az || v.word.toUpperCase().startsWith(az)) &&
        (!needle || v.word.toLowerCase().includes(needle)),
    ).sort((a, b) => a.word.localeCompare(b.word))
  }, [q, cat, az])

  const selected = results.find((r) => r.id === selectedId) ?? results[0]
  const spellable = q.replace(/[^a-z]/gi, '').toUpperCase().split('')

  return (
    <Page>
      <PageHeader eyebrow="Dictionary" title="ASL dictionary">
        Search an English word to see its sign. ASL does not map word for word onto English, so one sign can cover several English words.
      </PageHeader>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_14rem]">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden />
          <input
            className="input !pl-11 !pr-10"
            type="search"
            placeholder="Search a word, e.g. thank you"
            aria-label="Search the dictionary"
            value={q}
            onChange={(e) => update({ q: e.target.value, sign: '' })}
          />
          {q && (
            <button onClick={() => update({ q: '' })} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-500 hover:bg-slate-100">
              <X size={16} />
            </button>
          )}
        </div>
        <select className="input" aria-label="Filter by category" value={cat} onChange={(e) => update({ cat: e.target.value, sign: '' })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter by first letter">
        <button onClick={() => update({ az: '', sign: '' })} aria-pressed={!az} className={`chip !px-3 !py-1.5 ${!az ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-navy/10 hover:bg-sky-50'}`}>
          All
        </button>
        {LETTERS.map((l) => {
          const has = VOCAB.some((v) => v.word.toUpperCase().startsWith(l))
          return (
            <button
              key={l}
              disabled={!has}
              onClick={() => update({ az: az === l ? '' : l, sign: '' })}
              aria-pressed={az === l}
              className={`chip !px-3 !py-1.5 disabled:opacity-30 ${az === l ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-navy/10 hover:bg-sky-50'}`}
            >
              {l}
            </button>
          )
        })}
      </div>

      {results.length === 0 ? (
        <EmptyState
          title={q ? `No sign for “${q}” yet` : 'No signs match these filters'}
          action={
            <button className="btn btn-ghost" onClick={() => setParams({}, { replace: true })}>
              Reset filters
            </button>
          }
        >
          {q ? 'Signify’s dictionary is still growing. Names and unfamiliar words can be fingerspelled:' : 'Try removing a filter.'}
          {q && spellable.length > 0 && spellable.length <= 10 && (
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {spellable.map((ch, i) => {
                const l = letterByChar(ch)
                return l ? (
                  <li key={i}>
                    <Link to={`/learn/alphabet/${ch}`} className="flex w-16 flex-col items-center rounded-2xl bg-sky-50 p-2 hover:bg-sky-100">
                      <HandSVG shape={l.shape} label={`Fingerspelled ${ch}`} className="h-14" />
                      <span className="text-sm font-bold text-navy">{ch}</span>
                    </Link>
                  </li>
                ) : null
              })}
            </ul>
          )}
        </EmptyState>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <ul className="max-h-[34rem] space-y-1.5 overflow-y-auto rounded-3xl bg-white p-3 shadow-card ring-1 ring-navy/5" aria-label="Results">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => update({ sign: r.id })}
                  aria-current={selected?.id === r.id}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${selected?.id === r.id ? 'bg-navy text-white' : 'text-navy hover:bg-sky-50'}`}
                >
                  {r.word}
                </button>
              </li>
            ))}
          </ul>
          {selected && <SignPanel entry={selected} relatedHref={(id) => `/dictionary?sign=${id}`} />}
        </div>
      )}
    </Page>
  )
}
