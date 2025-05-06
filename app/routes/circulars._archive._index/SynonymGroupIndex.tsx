/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, useFetcher } from '@remix-run/react'
import type { action } from 'app/routes/synonyms/route'
import { useEffect, useState } from 'react'

import type { Circular } from '../circulars/circulars.lib'
import type { SynonymGroup } from '../synonyms/synonyms.lib'
import Spinner from '~/components/Spinner'

function SynonymList({
  eventIds,
  slugs,
  searchString,
}: {
  eventIds: string[]
  slugs: string[]
  searchString: string
}) {
  const [items, setItems] = useState<Circular[]>([])
  const fetcher = useFetcher<typeof action>()
  const data = new FormData()
  data.set('eventIds', eventIds.join(','))

  useEffect(() => {
    setItems(fetcher.data ?? [])
  }, [fetcher.data])

  return (
    <div>
      <details
        onClick={() => {
          fetcher.submit(data, { method: 'POST', action: '/synonyms' })
        }}
      >
        <summary>
          <Link to={`/circulars/events/${slugs.sort()[0]}${searchString}`}>
            {eventIds.join(', ')}
          </Link>
        </summary>
        <ol className="margin-left-3">
          {fetcher.state === 'submitting' && items.length === 0 && (
            <span className="text-middle">
              <Spinner />
            </span>
          )}
          {items.map(({ circularId, subject }) => {
            return (
              <li key={circularId} value={circularId}>
                <Link to={`/circulars/${circularId}`}>{subject}</Link>
              </li>
            )
          })}
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
          <SynonymList
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
