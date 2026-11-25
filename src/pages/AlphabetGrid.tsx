import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Page, PageHeader, ProgressBar, BackLink } from '../components/ui'
import HandSVG from '../components/HandSVG'
import { ALPHABET } from '../data/alphabet'
import { itemKey } from '../lib/lessons'
import { useProgress } from '../lib/progress'

export default function AlphabetGrid() {
  const { isLearned } = useProgress()
  const learned = ALPHABET.filter((a) => isLearned(itemKey('letter', a.letter))).length

  return (
    <Page>
      <BackLink to="/learn">Learn</BackLink>
      <PageHeader eyebrow="Fingerspelling" title="The ASL alphabet">
        Fingerspelling is used for names, places and words that have no sign of their own. It is one part of ASL, not the language
        itself. Pick a letter to see how the hand is formed.
      </PageHeader>

      <div className="card mb-8 flex flex-wrap items-center gap-6">
        <div className="min-w-[14rem] flex-1">
          <p className="text-sm font-semibold text-navy">
            {learned} of {ALPHABET.length} letters learned
          </p>
          <div className="mt-2">
            <ProgressBar value={(learned / ALPHABET.length) * 100} />
          </div>
        </div>
        <Link to="/learn/alphabet/A" className="btn btn-primary">
          {learned ? 'Keep going' : 'Start with A'}
        </Link>
        <Link to="/quiz/beginner" className="btn btn-ghost">
          Take a quiz
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {ALPHABET.map((a, i) => {
          const done = isLearned(itemKey('letter', a.letter))
          return (
            <motion.li key={a.letter} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}>
              <Link
                to={`/learn/alphabet/${a.letter}`}
                aria-label={`Letter ${a.letter}${done ? ', learned' : ''}${a.motion ? ', includes movement' : ''}`}
                className={`card group relative flex flex-col items-center !p-4 transition-all hover:-translate-y-1 hover:shadow-lift ${done ? 'ring-2 ring-emerald-300' : ''}`}
              >
                {done && (
                  <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">
                    <Check size={14} aria-hidden />
                  </span>
                )}
                <HandSVG shape={a.shape} label={`Handshape for ${a.letter}`} className="h-28 w-full transition-transform group-hover:scale-105" />
                <span className="mt-2 text-2xl font-extrabold text-navy">{a.letter}</span>
                {a.motion && <span className="chip mt-1 bg-sun-100 text-navy">Movement</span>}
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </Page>
  )
}
