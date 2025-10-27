/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'

import { Highlight } from '~/components/Highlight'

export function LuceneAccordion() {
  return (
    <details>
      <summary>Advanced Search</summary>
      <p className="usa-paragraph">
        To narrow the search results, use advanced search syntax. This allows
        for specifying which circular field to search (submitter, subject,
        and/or body). For additional information, refer to{' '}
        <Link className="usa-link" to="/docs/circulars/archive#advanced-search">
          the advanced search documentation
        </Link>
        {'. '}
      </p>
      <h4>Advanced Search Examples (click to copy):</h4>
      <div>
        <Highlight
          language="sh"
          code='subject:"Swift"'
          className="grid-col-4"
        />
        <Highlight language="sh" code='body:"GRB"' className="grid-col-4" />
        <Highlight
          language="sh"
          code='submitter:"Judith Racusin"'
          className="grid-col-4"
        />
      </div>
    </details>
  )
}
