import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Flame, Menu, X } from 'lucide-react'
import { useProgress } from '../lib/progress'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/learn', label: 'Learn', end: false },
  { to: '/practice', label: 'Practice', end: false },
  { to: '/dictionary', label: 'Dictionary', end: false },
  { to: '/progress', label: 'Progress', end: false },
]

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-navy" aria-label="Signify home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy">
        <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
          <path d="M9 21c0-6 2-10 7-10s7 4 7 10" fill="none" stroke="#FACC15" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="16" cy="22" r="2.4" fill="#3B82F6" />
        </svg>
      </span>
      Signify
    </Link>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { streak } = useProgress()
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])

  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-navy text-white' : 'text-ink-600 hover:bg-sky-50 hover:text-navy'}`

  return (
    <header className="sticky top-0 z-40 border-b border-navy/5 bg-canvas/85 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={link}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/progress" className="chip bg-sun-100 text-navy" aria-label={`${streak} day streak`}>
            <Flame size={14} className="text-sun-600" aria-hidden /> {streak}
          </Link>
          <button className="btn btn-ghost !p-2.5 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="flex flex-col gap-1 border-t border-navy/5 bg-canvas px-4 py-3 md:hidden">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={link}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-navy/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-ink-600 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-md">
          <Logo />
          <p className="mt-3">
            Signify is a learning aid for American Sign Language. ASL is a language of the Deaf community in the United States and
            parts of Canada. Other countries use different sign languages.
          </p>
        </div>
        <div className="max-w-md">
          <p className="font-semibold text-navy">Always verify</p>
          <p className="mt-1">
            Illustrations here are schematic. For authoritative demonstrations see{' '}
            <a href="https://www.lifeprint.com/" target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline">
              ASL University
            </a>{' '}
            and learn from Deaf teachers whenever you can.
          </p>
        </div>
      </div>
    </footer>
  )
}
