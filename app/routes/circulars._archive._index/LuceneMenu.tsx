/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'

import { CopyableCode } from '~/components/CopyableCode'

export function LuceneAccordion() {
  return (
    <details>
      <summary>Advanced Search</summary>
      <p className="usa-paragraph">
        To narrow the search results, use Lucene search syntax. This allows for
        specifying which circular field to search (submitter, subject, and/or
        body). Further documentation can be found{' '}
        <Link className="usa-link" to="/docs/circulars/advanced-search">
          here
        </Link>
        {'. '}
      </p>
      <h4>Lucene Examples (click to copy):</h4>
      <div>
        <CopyableCode text='subject:"Swift"' />
        <br />
        <CopyableCode text='body:"GRB"' />
        <br />
        <CopyableCode text='submitter:"Tomas Ahumada Mena"' />
      </div>
    </details>
  )
}
