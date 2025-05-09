/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, useFetcher } from '@remix-run/react'
import type { loader } from 'app/routes/synonym.circulars'
import { useEffect, useState } from 'react'

import type { Circular } from '../circulars/circulars.lib'
import type { SynonymGroup } from '../synonyms/synonyms.lib'
import Spinner from '~/components/Spinner'

function CircularsBelongingToASynonymGroup({
  eventIds,
  slugs,
  searchString,
}: {
  eventIds: string[]
  slugs: string[]
  searchString: string
}) {
  const [items, setItems] = useState<Circular[]>([])
  const fetcher = useFetcher<typeof loader>()
  const data = new FormData()
  const params = new URLSearchParams()
  eventIds.forEach((eventId) => params.append('eventIds', eventId))

  data.set('eventIds', eventIds.join(','))

  useEffect(() => {
    setItems(fetcher.data ?? [])
  }, [fetcher.data])

  return (
    <div>
      <details
        onClick={() => {
          fetcher.load(`/synonym/circulars?${params}`)
        }}
      >
        <summary>
          <Link to={`/circulars/events/${slugs.sort()[0]}${searchString}`}>
            {eventIds.join(', ')}
          </Link>
        </summary>
        <ol className="margin-left-3">
          {fetcher.state === 'loading' && items.length === 0 && (
            <span className="text-middle">
              <Spinner />
            </span>
          )}
          {items.map(({ circularId, subject }) => (
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
