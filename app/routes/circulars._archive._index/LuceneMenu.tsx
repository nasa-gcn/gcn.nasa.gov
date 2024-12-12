/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { Button } from '@trussworks/react-uswds'
import CopyToClipboard from 'react-copy-to-clipboard'

export function LuceneAccordion() {
  function copyableButton(text: string) {
    return (
      <CopyToClipboard text={text}>
        <Button type="button" outline>
          {text}
        </Button>
      </CopyToClipboard>
    )
  }
  return (
    <details>
      <summary>Advanced Search</summary>
      To narrow the search results, use Lucene search syntax. This allows for
      specifying which circular field to search (submitter, subject, and/or
      body). Further documentation can be found{' '}
      <Link className="usa-link" to="/docs/circulars/advanced-search">
        here
      </Link>
      {'. '}
      <h4>Lucene Examples (click to copy):</h4>
      <div>
        {copyableButton('subject:"Swift"')}
        {copyableButton('body:"GRB"')}
        {copyableButton('submitter:"Tomas Ahumada Mena"')}
      </div>
    </details>
  )
}
