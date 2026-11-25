import { Link } from 'react-router-dom'
import { Page, EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <Page>
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        title="We couldn't find that page"
        action={
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      >
        The link may be out of date, or the lesson may have moved. Try the Learn page to pick up where you left off.
      </EmptyState>
    </Page>
  )
}
