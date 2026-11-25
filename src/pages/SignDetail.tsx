import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BackLink, Page } from '../components/ui'
import SignPanel from '../components/SignPanel'
import { VOCAB, vocabById } from '../data/vocabulary'

export default function SignDetail() {
  const { id = '' } = useParams()
  const entry = vocabById(id)
  if (!entry) return <Navigate to="/learn/vocabulary" replace />

  const siblings = VOCAB.filter((v) => v.category === entry.category)
  const i = siblings.findIndex((s) => s.id === entry.id)
  const prev = siblings[i - 1]
  const next = siblings[i + 1]

  return (
    <Page>
      <BackLink to={`/learn/vocabulary/${entry.category}`}>Back to category</BackLink>
      <SignPanel asH1 entry={entry} relatedHref={(rid) => `/learn/sign/${rid}`} />
      <nav aria-label="Sign navigation" className="mt-10 flex items-center justify-between">
        {prev ? (
          <Link to={`/learn/sign/${prev.id}`} className="btn btn-ghost">
            <ArrowLeft size={16} aria-hidden /> {prev.word}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/learn/sign/${next.id}`} className="btn btn-primary">
            {next.word} <ArrowRight size={16} aria-hidden />
          </Link>
        ) : (
          <Link to="/quiz/beginner" className="btn btn-accent">
            Test yourself <ArrowRight size={16} aria-hidden />
          </Link>
        )}
      </nav>
    </Page>
  )
}
