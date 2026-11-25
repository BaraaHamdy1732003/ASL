import { Link } from 'react-router-dom'
import { ExternalLink, Info } from 'lucide-react'
import { BackLink, Page, PageHeader } from '../components/ui'
import HandSVG from '../components/HandSVG'
import { vocabById } from '../data/vocabulary'

const SHOWN = ['one', 'two', 'three', 'four', 'five', 'ten'] as const
const NUM: Record<(typeof SHOWN)[number], string> = { one: '1', two: '2', three: '3', four: '4', five: '5', ten: '10' }

const DESCRIBED = [
  { n: '0', how: 'Form an O: all fingertips curve to touch the thumb (same handshape as the letter O).' },
  { n: '6', how: 'Thumb touches the little finger; the other three fingers stay up.' },
  { n: '7', how: 'Thumb touches the ring finger; the other fingers stay up.' },
  { n: '8', how: 'Thumb touches the middle finger; the other fingers stay up.' },
  { n: '9', how: 'Thumb touches the index finger; the other fingers stay up.' },
]

const LINKS = [
  { label: 'Numbers 1–10', href: 'https://lifeprint.com/asl101/pages-signs/n/numbers1-10.htm' },
  { label: 'Numbers 11–20', href: 'https://lifeprint.com/asl101/pages-signs/n/numbers11-20.htm' },
  { label: 'Numbers 21–30', href: 'https://lifeprint.com/asl101/pages-signs/n/numbers21-30.htm' },
  { label: 'All number lessons', href: 'https://lifeprint.com/asl101/pages-layout/numbers.htm' },
]

export default function NumbersGuide() {
  return (
    <Page>
      <BackLink to="/learn">Learn</BackLink>
      <PageHeader eyebrow="Numbers" title="ASL numbers">
        ASL number signs are different from English counting: some use movement, and numbers above 10 have their own patterns. Start
        with the handshapes below.
      </PageHeader>

      <section aria-labelledby="illustrated" className="mb-10">
        <h2 id="illustrated" className="mb-4 text-xl font-bold">
          Illustrated: 1–5 and 10
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SHOWN.map((id) => {
            const v = vocabById(id)!
            return (
              <li key={id}>
                <Link to={`/learn/sign/${id}`} className="card flex flex-col items-center !p-4 transition-all hover:-translate-y-1 hover:shadow-lift">
                  <HandSVG shape={v.motion.start.shape} label={`ASL number ${NUM[id]}`} className="h-28" />
                  <span className="mt-2 text-2xl font-extrabold text-navy">{NUM[id]}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="described" className="mb-10">
        <h2 id="described" className="mb-4 text-xl font-bold">
          Described: 0 and 6–9
        </h2>
        <div className="card divide-y divide-slate-100">
          {DESCRIBED.map((d) => (
            <div key={d.n} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-lg font-extrabold text-white">{d.n}</span>
              <p className="pt-1.5 text-sm text-ink-600">{d.how}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="beyond" className="rounded-3xl bg-sun-100/70 p-6">
        <h2 id="beyond" className="flex items-center gap-2 text-xl font-bold">
          <Info size={20} className="text-sun-600" aria-hidden /> 11 to 100
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink">
          Numbers from 11 upward use movement and specific patterns that a still schematic cannot show faithfully, so Signify does not
          draw them. Learn them from ASL University’s video lessons:
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                {l.label} <ExternalLink size={14} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  )
}
