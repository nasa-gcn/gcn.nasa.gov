/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { useState } from 'react'
import type { CircularGroupingMetadata } from '../_gcn.circulars/circulars.lib'

export default function ({
  allItems,
  searchString,
  query,
  totalItems,
}: {
  allItems: CircularGroupingMetadata[]
  searchString: string
  query?: string
  totalItems: number
}) {
  if (searchString) searchString = `?${searchString}`
  const [detailsToggle, setDetailsToggle] = useState(false)
  const expandAllText = detailsToggle ? 'Close All' : 'Open All'
  return (
    <>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}
      <div className="margin-bottom-2">
        <details
          className="margin-bottom-2 margin-top-1"
          aria-label="view all toggle"
          onClick={() => {
            setDetailsToggle(!detailsToggle)
          }}
        >
          <summary className="text-base border-base-lighter">
            {expandAllText}
          </summary>
        </details>
        {totalItems > 0 &&
          allItems.map(({ id, circulars }, groupIndex) => (
            <details open={detailsToggle} key={groupIndex}>
              <summary>
                {circulars.map((circular, index) =>
                  circular ? (
                    <span
                      key={circular.eventId}
                    >{`${circular.eventId}, `}</span>
                  ) : undefined
                )}
              </summary>
              <ol>
                {circulars.map((circular, index) =>
                  circular ? (
                    <li
                      id={circular.circularId.toString()}
                      value={circular.circularId}
                      key={index}
                      className="border-base-lighter"
                    >
                      <Link to={`/circulars/${circular.circularId}`}>
                        {circular.subject}
                      </Link>
                    </li>
                  ) : undefined
                )}
              </ol>
            </details>
          ))}
      </div>
    </>
  )
}
