import { Link } from 'react-router-dom'
import { Eye, Hand, Lightbulb, MoveRight } from 'lucide-react'
import SignDemo from './SignDemo'
import { AccuracyNote, LearnedButton } from './ui'
import { categoryById, vocabById } from '../data/vocabulary'
import { itemKey } from '../lib/lessons'
import { useProgress } from '../lib/progress'
import type { VocabEntry } from '../types'

interface Props {
  entry: VocabEntry
  relatedHref: (id: string) => string
  /** render the word as the page's h1 (when the panel is the main content of a page) */
  asH1?: boolean
}

export default function SignPanel({ entry, relatedHref, asH1 = false }: Props) {
  const Heading = asH1 ? 'h1' : 'h2'
  const { isLearned, toggleLearned } = useProgress()
  const key = itemKey('sign', entry.id)
  const cat = categoryById(entry.category)
  const related = entry.related.map((id) => vocabById(id)).filter((x): x is VocabEntry => Boolean(x))

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Heading className="text-4xl font-extrabold text-navy">{entry.word}</Heading>
          <span className={`chip ${cat.tone}`}>
            {cat.emoji} {cat.name}
          </span>
        </div>
        <SignDemo
          key={entry.id}
          motion={entry.motion}
          label={`Schematic demonstration of the ASL sign for ${entry.word}. ${entry.movement}`}
        />
      </div>

      <div className="space-y-5">
        <section className="card">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy">Step by step</h3>
          <ol className="space-y-3">
            {entry.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex gap-3">
              <Hand size={18} className="mt-0.5 shrink-0 text-sky-600" aria-hidden />
              <div>
                <dt className="font-semibold text-navy">Handshape</dt>
                <dd className="text-ink-600">{entry.handshape}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MoveRight size={18} className="mt-0.5 shrink-0 text-sky-600" aria-hidden />
              <div>
                <dt className="font-semibold text-navy">Movement</dt>
                <dd className="text-ink-600">{entry.movement}</dd>
              </div>
            </div>
            {entry.nonManual && (
              <div className="flex gap-3">
                <Eye size={18} className="mt-0.5 shrink-0 text-sky-600" aria-hidden />
                <div>
                  <dt className="font-semibold text-navy">Face and body</dt>
                  <dd className="text-ink-600">{entry.nonManual}</dd>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-sun-600" aria-hidden />
              <div>
                <dt className="font-semibold text-navy">When to use it</dt>
                <dd className="text-ink-600">{entry.example}</dd>
              </div>
            </div>
          </dl>
          {entry.notes && <p className="mt-5 rounded-2xl bg-sky-50 p-3 text-sm text-ink">{entry.notes}</p>}
        </section>

        <AccuracyNote complex={entry.fidelity === 'complex'} partial={entry.partial} />

        <LearnedButton learned={isLearned(key)} onClick={() => toggleLearned(key)} />

        {related.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-navy">Related vocabulary</h3>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link key={r.id} to={relatedHref(r.id)} className="chip bg-white text-navy ring-1 ring-navy/10 hover:bg-sky-50">
                  {r.word}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
