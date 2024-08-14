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

      {allItems.map(({ group, members }) => (
        <div key={group.synonymId}>
          <details>
            <summary>
              <Link to={`/group/${group.synonymId}${searchString}`}>
                {group.eventIds.join(', ')}
              </Link>
            </summary>
            <ul>
              {members.map(({ circularId, subject }) => {
                return (
                  <li key={circularId}>
                    <Link to={`/circular/${circularId}`}>{subject}</Link>
                  </li>
                )
              })}
            </ul>
          </details>
        </div>
      ))}
    </>
  )
}
