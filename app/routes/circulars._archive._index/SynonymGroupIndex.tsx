/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, useFetcher } from '@remix-run/react'

import type { SynonymGroup } from '../synonyms/synonyms.lib'
import Spinner from '~/components/Spinner'
import type { loader } from '~/routes/api.synonym.circulars'

function CircularsBelongingToASynonymGroup({
  eventIds,
  slugs,
  searchString,
}: {
  eventIds: string[]
  slugs: string[]
  searchString: string
}) {
  const fetcher = useFetcher<typeof loader>()
  const params = new URLSearchParams(
    eventIds.map((eventId) => ['eventIds', eventId])
  )

  return (
    <div>
      <details
        onClick={() => {
          fetcher.load(`/api/synonym/circulars?${params}`)
        }}
      >
        <summary>
          <Link to={`/circulars/events/${slugs.sort()[0]}${searchString}`}>
            {eventIds.join(', ')}
          </Link>
        </summary>
        <ol className="margin-left-3">
          {fetcher.state === 'loading' && !fetcher.data?.length && (
            <span className="text-middle">
              <Spinner />
            </span>
          )}
          {fetcher.data?.map(({ circularId, subject }) => (
            <li key={circularId} value={circularId}>
              <Link to={`/circulars/${circularId}`}>{subject}</Link>
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}

export default function ({
  allItems,
  totalItems,
  searchString,
  query,
}: {
  allItems: SynonymGroup[]
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
      <div className="margin-y-2">
        {allItems.map(({ synonymId, eventIds, slugs }) => (
          <CircularsBelongingToASynonymGroup
            eventIds={eventIds}
            slugs={slugs}
            searchString={searchString}
            key={synonymId}
          />
        ))}
      </div>
    </>
  )
}
