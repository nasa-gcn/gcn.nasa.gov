import { Link } from '@remix-run/react'

export function LuceneAccordion() {
  return (
    <details
    // className="usa-accordion usa-accordion--multiselectable usa-accordion--bordered margin-y-1"
    // data-allow-multiple
    // onClick={() => setIsOpen(!isOpen)}
    >
      <summary>Advanced Search</summary>

      <div
        id="accordion-item-1"
        className="usa-accordion__content usa-prose padding-y-1"
      >
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
