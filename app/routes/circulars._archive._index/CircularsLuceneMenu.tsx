import { Link } from '@remix-run/react'
import { Button } from '@trussworks/react-uswds'

export function LuceneAccordion({
  querySetter,
}: {
  querySetter: (arg0: string) => void
}) {
  function populateSearch() {
    querySetter('value')
    console.log('clickedPopulateSearch')
    return null
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
        <div>
          <Button type="button" onClick={() => populateSearch()}>
            child
          </Button>
        </div>
      </div>
    </details>
  )
}
