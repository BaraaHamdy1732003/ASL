import { ALPHABET } from '../data/alphabet'
import { CATEGORIES, VOCAB } from '../data/vocabulary'

export type ItemKind = 'letter' | 'sign'
export const itemKey = (kind: ItemKind, id: string) => `${kind}:${id}`
export const parseKey = (key: string): { kind: ItemKind; id: string } => {
  const [kind, ...rest] = key.split(':')
  return { kind: kind as ItemKind, id: rest.join(':') }
}

export interface Lesson {
  id: string
  title: string
  blurb: string
  to: string
  keys: string[]
  group: 'Alphabet' | 'Vocabulary'
}

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const alphabetLessons: Lesson[] = chunk(ALPHABET, 5).map((group) => {
  const first = group[0].letter
  const last = group[group.length - 1].letter
  return {
    id: `alphabet-${first}${last}`,
    title: `Alphabet ${first}–${last}`,
    blurb: `Fingerspell ${group.map((g) => g.letter).join(', ')}.`,
    to: `/learn/alphabet/${first}`,
    keys: group.map((g) => itemKey('letter', g.letter)),
    group: 'Alphabet',
  }
})

const vocabLessons: Lesson[] = CATEGORIES.map((c) => ({
  id: `vocab-${c.id}`,
  title: c.name,
  blurb: c.blurb,
  to: `/learn/vocabulary/${c.id}`,
  keys: VOCAB.filter((v) => v.category === c.id).map((v) => itemKey('sign', v.id)),
  group: 'Vocabulary' as const,
}))

export const LESSONS: Lesson[] = [...alphabetLessons, ...vocabLessons]
export const ALL_KEYS = [
  ...ALPHABET.map((a) => itemKey('letter', a.letter)),
  ...VOCAB.map((v) => itemKey('sign', v.id)),
]
export const lessonDone = (lesson: Lesson, learned: string[]) => lesson.keys.every((k) => learned.includes(k))
export const lessonProgress = (lesson: Lesson, learned: string[]) =>
  lesson.keys.filter((k) => learned.includes(k)).length

export const LEVELS = [
  { name: 'Newcomer', min: 0 },
  { name: 'Beginner', min: 10 },
  { name: 'Intermediate', min: 25 },
  { name: 'Advanced', min: 45 },
]
export const levelFor = (count: number) => {
  let idx = 0
  LEVELS.forEach((l, i) => {
    if (count >= l.min) idx = i
  })
  const next = LEVELS[idx + 1]
  return { current: LEVELS[idx], next, toNext: next ? next.min - count : 0 }
}
