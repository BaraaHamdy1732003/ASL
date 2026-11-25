import { ALPHABET, letterByChar } from '../data/alphabet'
import { VOCAB, vocabById } from '../data/vocabulary'
import type { HandShape } from '../types'
import { itemKey, parseKey } from './lessons'

export type Visual =
  | { type: 'hand'; shape: HandShape; label: string }
  | { type: 'sign'; id: string }
  | { type: 'text'; text: string }

export interface Option {
  id: string
  label: string
}

export interface Question {
  id: string
  key: string
  prompt: string
  visual: Visual
  options: Option[]
  correctId: string
  explanation: string
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export const shuffle = <T,>(arr: readonly T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const STATIC_LETTERS = ALPHABET.filter((a) => !a.motion)

function pickOptions<T extends { id: string }>(correct: T, preferred: T[], pool: T[], toOption: (t: T) => Option): Option[] {
  const used = new Set([correct.id])
  const distractors: T[] = []
  for (const t of [...shuffle(preferred), ...shuffle(pool)]) {
    if (distractors.length >= 3) break
    if (!used.has(t.id)) {
      used.add(t.id)
      distractors.push(t)
    }
  }
  return shuffle([correct, ...distractors]).map(toOption)
}

let counter = 0
const qid = () => `q${++counter}`

export function letterVisual(letter: string, confusable = false): Question {
  const e = letterByChar(letter)!
  const preferred = confusable ? e.similarTo.map((c) => letterByChar(c)).filter((x): x is NonNullable<typeof x> => Boolean(x) && !x!.motion) : []
  const pool = STATIC_LETTERS.map((a) => ({ ...a, id: a.letter }))
  const options = pickOptions({ ...e, id: e.letter }, preferred.map((p) => ({ ...p, id: p.letter })), pool, (t) => ({ id: t.letter, label: t.letter }))
  return {
    id: qid(),
    key: itemKey('letter', e.letter),
    prompt: 'Which letter is this handshape?',
    visual: { type: 'hand', shape: e.shape, label: 'A handshape from the ASL alphabet' },
    options,
    correctId: e.letter,
    explanation: `This is ${e.letter}. ${e.summary}`,
  }
}

export function letterDescribe(letter: string): Question {
  const e = letterByChar(letter)!
  const pool = ALPHABET.map((a) => ({ ...a, id: a.letter }))
  const preferred = e.similarTo.map((c) => letterByChar(c)).filter((x): x is NonNullable<typeof x> => Boolean(x)).map((p) => ({ ...p, id: p.letter }))
  return {
    id: qid(),
    key: itemKey('letter', e.letter),
    prompt: 'Which letter matches this description?',
    visual: { type: 'text', text: e.summary.replace(new RegExp(`\\b${e.letter}\\b`, 'g'), '__') },
    options: pickOptions({ ...e, id: e.letter }, preferred, pool, (t) => ({ id: t.letter, label: t.letter })),
    correctId: e.letter,
    explanation: `That describes ${e.letter}. ${e.steps.join(' ')}`,
  }
}

export function signVisual(id: string): Question {
  const v = vocabById(id)!
  const same = VOCAB.filter((x) => x.category === v.category)
  return {
    id: qid(),
    key: itemKey('sign', v.id),
    prompt: 'Which word does this sign mean?',
    visual: { type: 'sign', id: v.id },
    options: pickOptions(v, same, VOCAB, (t) => ({ id: t.id, label: t.word })),
    correctId: v.id,
    explanation: `This is “${v.word}”. ${v.steps.join(' ')}`,
  }
}

export function signDescribe(id: string): Question {
  const v = vocabById(id)!
  const same = VOCAB.filter((x) => x.category === v.category)
  return {
    id: qid(),
    key: itemKey('sign', v.id),
    prompt: 'Which sign matches this description?',
    visual: { type: 'text', text: `Handshape: ${v.handshape}. Movement: ${v.movement}` },
    options: pickOptions(v, same, VOCAB, (t) => ({ id: t.id, label: t.word })),
    correctId: v.id,
    explanation: `That is “${v.word}”. ${v.example}`,
  }
}

const take = <T,>(arr: readonly T[], n: number) => shuffle(arr).slice(0, n)

export function buildQuiz(difficulty: Difficulty): Question[] {
  const easyLetters = STATIC_LETTERS.filter((a) => 'ABCDEFGHKLMNO'.includes(a.letter))
  const easySigns = VOCAB.filter((v) => v.category === 'greetings' || v.category === 'everyday')
  if (difficulty === 'beginner') {
    return shuffle([
      ...take(easyLetters, 5).map((l) => letterVisual(l.letter)),
      ...take(easySigns, 3).map((s) => signVisual(s.id)),
    ])
  }
  if (difficulty === 'intermediate') {
    return shuffle([
      ...take(STATIC_LETTERS, 4).map((l) => letterVisual(l.letter)),
      ...take(VOCAB, 4).map((s) => signVisual(s.id)),
      ...take(ALPHABET, 2).map((l) => letterDescribe(l.letter)),
    ])
  }
  return shuffle([
    ...take(STATIC_LETTERS.filter((a) => a.similarTo.length > 0), 3).map((l) => letterVisual(l.letter, true)),
    ...take(ALPHABET, 2).map((l) => letterDescribe(l.letter)),
    ...take(VOCAB, 3).map((s) => signDescribe(s.id)),
    ...take(VOCAB, 2).map((s) => signVisual(s.id)),
  ])
}

export function buildPractice(mode: 'recognition' | 'multiple-choice' | 'memory', count = 8): Question[] {
  if (mode === 'multiple-choice') {
    return shuffle([
      ...take(ALPHABET, Math.ceil(count / 2)).map((l) => letterDescribe(l.letter)),
      ...take(VOCAB, Math.floor(count / 2)).map((s) => signDescribe(s.id)),
    ])
  }
  return shuffle([
    ...take(STATIC_LETTERS, Math.ceil(count / 2)).map((l) => letterVisual(l.letter)),
    ...take(VOCAB, Math.floor(count / 2)).map((s) => signVisual(s.id)),
  ])
}

export function buildReview(mistakeKeys: string[]): Question[] {
  return shuffle(
    mistakeKeys
      .map((k) => {
        const { kind, id } = parseKey(k)
        if (kind === 'letter') {
          const e = letterByChar(id)
          if (!e) return null
          return e.motion ? letterDescribe(id) : letterVisual(id)
        }
        return vocabById(id) ? signVisual(id) : null
      })
      .filter((q): q is Question => q !== null),
  )
}
