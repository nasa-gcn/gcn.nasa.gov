/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'

import type { SynonymGroupWithMembers } from '../synonyms/synonyms.lib'

export default function ({
  allItems,
  totalItems,
  searchString,
  query,
}: {
  allItems: SynonymGroupWithMembers[]
  totalItems: number
  searchString: string
  query?: string
}) {
  return (
    <>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}

      {allItems.map(({ synonymId, eventIds, slugs, members }) => (
        <div key={synonymId}>
          <details>
            <summary>
              <Link to={`/circulars/events/${slugs.sort()[0]}${searchString}`}>
                {eventIds.join(', ')}
              </Link>
            </summary>
            <ol className="margin-left-3">
              {members.map(({ circularId, subject }) => {
                return (
                  <li key={circularId} value={circularId}>
                    <Link to={`/circulars/${circularId}`}>{subject}</Link>
                  </li>
                )
              })}
            </ol>
          </details>
        </div>
      ))}
    </>
  )
}
