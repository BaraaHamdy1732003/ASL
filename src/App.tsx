import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Footer, Navbar } from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import AlphabetGrid from './pages/AlphabetGrid'
import LetterDetail from './pages/LetterDetail'
import Vocabulary from './pages/Vocabulary'
import SignDetail from './pages/SignDetail'
import NumbersGuide from './pages/NumbersGuide'
import Practice from './pages/Practice'
import Quiz from './pages/Quiz'
import Dictionary from './pages/Dictionary'
import Progress from './pages/Progress'
import NotFound from './pages/NotFound'

const CameraCoach = lazy(() => import('./pages/CameraCoach'))

export default function App() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Dashboard />} />
            <Route path="/learn/alphabet" element={<AlphabetGrid />} />
            <Route path="/learn/alphabet/:letter" element={<LetterDetail />} />
            <Route path="/learn/numbers" element={<NumbersGuide />} />
            <Route path="/learn/vocabulary" element={<Vocabulary />} />
            <Route path="/learn/vocabulary/:category" element={<Vocabulary />} />
            <Route path="/learn/sign/:id" element={<SignDetail />} />
            <Route path="/practice" element={<Practice />} />
            <Route
              path="/practice/camera"
              element={
                <Suspense fallback={<p className="mx-auto max-w-6xl px-4 py-12 text-center text-ink-600">Loading camera coach…</p>}>
                  <CameraCoach />
                </Suspense>
              }
            />
            <Route path="/practice/:mode" element={<Practice />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:difficulty" element={<Quiz />} />
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}
