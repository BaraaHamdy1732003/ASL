import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, Eye, Heart, Languages, Users } from 'lucide-react'
import { Page } from '../components/ui'
import HandSVG from '../components/HandSVG'
import { ALPHABET, letterByChar } from '../data/alphabet'
import { CATEGORIES, VOCAB } from '../data/vocabulary'
import { LESSONS } from '../lib/lessons'

const WORD = ['S', 'I', 'G', 'N']

const WHY = [
  {
    icon: Users,
    title: 'Include more people',
    body: 'Millions of Deaf and hard-of-hearing people use sign language every day. Even a few signs make a conversation more welcoming.',
  },
  {
    icon: Languages,
    title: 'A real language',
    body: 'ASL has its own grammar and vocabulary. It is not English on the hands, and it is not the same as British, French or other sign languages.',
  },
  {
    icon: Eye,
    title: 'Face and body matter',
    body: 'Eyebrows, head tilts and mouth shapes carry grammar, such as marking a question. Each lesson points these out.',
  },
]

export default function Home() {
  const stats = [
    { value: ALPHABET.length, label: 'Fingerspelling letters' },
    { value: VOCAB.length, label: 'Vocabulary signs' },
    { value: LESSONS.length, label: 'Guided lessons' },
    { value: 3, label: 'Quiz levels' },
  ]
  const featured = [LESSONS[0], LESSONS.find((l) => l.id === 'vocab-greetings')!, LESSONS.find((l) => l.id === 'vocab-everyday')!]

  return (
    <Page className="!max-w-none !px-0 !py-0">
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-canvas to-canvas">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="chip mb-5 bg-white text-navy shadow-card ring-1 ring-navy/5">
              <span className="h-2 w-2 rounded-full bg-sun" /> American Sign Language for beginners
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              A New Language.
              <span className="block text-sky">A New Way to Connect.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-600">
              Learn ASL through clear visual lessons, step-by-step handshape guides, practice exercises and quizzes. No
              experience needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/learn" className="btn btn-primary !px-6 !py-3.5 text-base">
                Start Learning <ArrowRight size={18} aria-hidden />
              </Link>
              <Link to="/dictionary" className="btn btn-ghost !px-6 !py-3.5 text-base">
                Explore Signs
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md" aria-label="The word SIGN fingerspelled in ASL">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-sky-100 to-sun-100 blur-2xl" aria-hidden />
            <div className="relative grid grid-cols-2 gap-4">
              {WORD.map((ch, i) => {
                const entry = letterByChar(ch)!
                return (
                  <motion.div
                    key={ch}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }}
                    className={`card flex flex-col items-center !p-4 ${i % 2 ? 'translate-y-6' : ''}`}
                  >
                    <HandSVG shape={entry.shape} label={`Fingerspelled letter ${ch}`} className="h-36 w-full" />
                    <span className="mt-1 text-2xl font-extrabold text-navy">{ch}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
        <section aria-label="Learning statistics" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <p className="text-4xl font-extrabold text-navy">{s.value}</p>
              <p className="mt-1 text-sm text-ink-600">{s.label}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-1">Featured lessons</p>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Begin with these</h2>
            </div>
            <Link to="/learn" className="hidden text-sm font-semibold text-sky-700 hover:underline sm:block">
              All lessons →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((l) => (
              <Link key={l.id} to={l.to} className="card group transition-all hover:-translate-y-1 hover:shadow-lift">
                <span className="chip bg-sky-50 text-sky-700">{l.group}</span>
                <h3 className="mt-4 text-xl font-bold">{l.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{l.blurb}</p>
                <p className="mt-5 flex items-center gap-1 text-sm font-semibold text-navy">
                  {l.keys.length} signs <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow mb-1">Popular categories</p>
          <h2 className="mb-6 text-2xl font-extrabold sm:text-3xl">Learn words by topic</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/learn/vocabulary/${c.id}`} className={`group rounded-3xl p-5 transition-all hover:-translate-y-1 hover:shadow-lift ${c.tone}`}>
                <span className="text-3xl" aria-hidden>
                  {c.emoji}
                </span>
                <p className="mt-3 font-bold">{c.name}</p>
                <p className="text-xs text-ink-600">{VOCAB.filter((v) => v.category === c.id).length} signs</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-4xl bg-navy p-8 text-white sm:p-12">
          <div className="max-w-2xl">
            <p className="eyebrow !text-sun">Why it matters</p>
            <h2 className="mt-2 !text-white text-3xl font-extrabold sm:text-4xl">Sign language opens a conversation.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title}>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sun">
                  <w.icon size={20} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold !text-white">{w.title}</h3>
                <p className="mt-2 text-sm text-blue-100">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid items-center gap-6 rounded-4xl bg-sun-100 p-8 sm:grid-cols-[1fr_auto] sm:p-10">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-navy">
              <BookOpenCheck size={22} aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-extrabold">Try the first lesson: the letter A</h2>
              <p className="mt-1 text-sm text-ink-600">
                Watch the handshape, read the finger positions, mark it learned and take a short quiz.
              </p>
            </div>
          </div>
          <Link to="/learn/alphabet/A" className="btn btn-primary">
            Learn the letter A <Heart size={16} aria-hidden />
          </Link>
        </section>
      </div>
    </Page>
  )
}
