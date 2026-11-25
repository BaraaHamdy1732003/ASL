import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ALL_KEYS, LESSONS, lessonDone } from './lessons'

export interface QuizResult {
  id: string
  mode: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  score: number
  total: number
  date: string
  wrongKeys: string[]
}

export interface ProgressState {
  learned: string[]
  recent: { key: string; at: number }[]
  mistakes: Record<string, number>
  quizzes: QuizResult[]
  activity: Record<string, number>
  dailyGoal: number
}

const KEY = 'signify:v1'
const empty: ProgressState = { learned: [], recent: [], mistakes: {}, quizzes: [], activity: {}, dailyGoal: 3 }

export const dayKey = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty
    return { ...empty, ...JSON.parse(raw) }
  } catch {
    return empty
  }
}

export function computeStreak(activity: Record<string, number>) {
  let streak = 0
  const d = new Date()
  // today may still be empty; the streak is alive if yesterday had activity
  if (!activity[dayKey(d)]) d.setDate(d.getDate() - 1)
  while (activity[dayKey(d)]) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export interface Badge {
  id: string
  name: string
  description: string
  earned: boolean
}

interface Ctx {
  state: ProgressState
  toggleLearned: (key: string) => void
  isLearned: (key: string) => boolean
  recordAnswer: (key: string, correct: boolean) => void
  saveQuiz: (r: Omit<QuizResult, 'id' | 'date'>) => void
  setDailyGoal: (n: number) => void
  reset: () => void
  streak: number
  todayCount: number
  learnedCount: number
  percent: number
  lessonsDone: number
  badges: Badge[]
}

const ProgressContext = createContext<Ctx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable (private mode); progress then lasts for the session */
    }
  }, [state])

  const bump = (s: ProgressState): ProgressState => {
    const k = dayKey()
    return { ...s, activity: { ...s.activity, [k]: (s.activity[k] ?? 0) + 1 } }
  }

  const toggleLearned = useCallback((key: string) => {
    setState((s) => {
      if (s.learned.includes(key)) return { ...s, learned: s.learned.filter((k) => k !== key) }
      return bump({
        ...s,
        learned: [...s.learned, key],
        recent: [{ key, at: Date.now() }, ...s.recent.filter((r) => r.key !== key)].slice(0, 12),
      })
    })
  }, [])

  const recordAnswer = useCallback((key: string, correct: boolean) => {
    setState((s) => {
      const mistakes = { ...s.mistakes }
      if (correct) delete mistakes[key]
      else mistakes[key] = (mistakes[key] ?? 0) + 1
      return bump({ ...s, mistakes })
    })
  }, [])

  const saveQuiz = useCallback((r: Omit<QuizResult, 'id' | 'date'>) => {
    setState((s) =>
      bump({
        ...s,
        quizzes: [...s.quizzes, { ...r, id: `${Date.now()}`, date: new Date().toISOString() }].slice(-50),
      }),
    )
  }, [])

  const setDailyGoal = useCallback((n: number) => setState((s) => ({ ...s, dailyGoal: n })), [])
  const reset = useCallback(() => setState(empty), [])

  const value = useMemo<Ctx>(() => {
    const learnedCount = state.learned.length
    const lessonsDone = LESSONS.filter((l) => lessonDone(l, state.learned)).length
    const streak = computeStreak(state.activity)
    const best = state.quizzes.reduce((m, q) => Math.max(m, q.total ? q.score / q.total : 0), 0)
    const badges: Badge[] = [
      { id: 'first', name: 'First sign', description: 'Mark your first sign as learned.', earned: learnedCount >= 1 },
      { id: 'ten', name: 'Ten signs', description: 'Learn 10 signs.', earned: learnedCount >= 10 },
      {
        id: 'alphabet',
        name: 'Fingerspeller',
        description: 'Learn all 26 letters.',
        earned: ALL_KEYS.filter((k) => k.startsWith('letter:')).every((k) => state.learned.includes(k)),
      },
      { id: 'streak3', name: 'Three-day streak', description: 'Practice three days in a row.', earned: streak >= 3 },
      { id: 'quiz', name: 'Quiz taker', description: 'Finish your first quiz.', earned: state.quizzes.length >= 1 },
      { id: 'ace', name: 'Sharp eyes', description: 'Score 90% or higher on a quiz.', earned: best >= 0.9 },
      { id: 'lesson', name: 'Lesson complete', description: 'Complete a full lesson.', earned: lessonsDone >= 1 },
    ]
    return {
      state,
      toggleLearned,
      isLearned: (key: string) => state.learned.includes(key),
      recordAnswer,
      saveQuiz,
      setDailyGoal,
      reset,
      streak,
      todayCount: state.activity[dayKey()] ?? 0,
      learnedCount,
      percent: Math.round((learnedCount / ALL_KEYS.length) * 100),
      lessonsDone,
      badges,
    }
  }, [state, toggleLearned, recordAnswer, saveQuiz, setDailyGoal, reset])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>')
  return ctx
}
