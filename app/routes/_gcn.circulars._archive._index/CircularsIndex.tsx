/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'

import type { CircularMetadata } from '../_gcn.circulars/circulars.lib'

export default function ({
  allItems,
  searchString,
  totalItems,
  query,
}: {
  allItems: CircularMetadata[]
  searchString: string
  totalItems: number
  query?: string
}) {
  return (
    <>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}
      <ol>
        {allItems.map(({ circularId, subject }) => (
          <li key={circularId} value={circularId}>
            <Link
              reloadDocument
              className="usa-link"
              to={`/circulars/${circularId}${searchString}`}
            >
              {subject}
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
