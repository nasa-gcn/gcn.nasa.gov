import { Link } from '@remix-run/react'

export function LuceneAccordion() {
  return (
    <details>
      <summary>Advanced Search</summary>

      <div>
        To narrow the search results, use Lucene search syntax. This allows for
        specifying which circular field to search (submitter, subject, and/or
        body). Further documentation can be found on the{' '}
        <Link className="usa-link" to="/docs/circulars/lucene">
          Lucene Search Syntax Page
        </Link>
        {'. '}
      </div>
    </details>
  )
}
