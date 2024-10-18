import { Link } from '@remix-run/react'
import { Button } from '@trussworks/react-uswds'

export function LuceneAccordion({
  query,
  querySetter,
}: {
  query?: string
  querySetter: (value: string) => void
}) {
  function populateSearch(value: string) {
    querySetter(`${query} ${value}`)
  }
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
        <h4>Lucene Examples:</h4>
        <div>
          <Button
            type="button"
            outline
            onClick={() => populateSearch('subject:"Swift"')}
          >
            subject:"Swift"
          </Button>
          <Button
            type="button"
            outline
            onClick={() => populateSearch('body:"GRB"')}
          >
            body:"GRB"
          </Button>
          <Button
            type="button"
            outline
            onClick={() => populateSearch('submitter:"Tomas Ahumada Mena"')}
          >
            submitter:"Tomas Ahumada Mena"
          </Button>
        </div>
      </div>
    </details>
  )
}
