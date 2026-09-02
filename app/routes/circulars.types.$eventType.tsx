/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import {
  MetaFunction,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import clamp from 'lodash/clamp'
import { useId, useState } from 'react'

import {
  circularRedirect,
  getChangeRequests,
  search,
} from './circulars/circulars.server'
import PaginationSelectionFooter from '~/components/pagination/PaginationSelectionFooter'
import { feature, origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'
import ArchiveHeader from '~/routes/circulars._archive._index/ArchiveHeader'
import ArchiveIndex from '~/routes/circulars._archive._index/ArchiveIndex'
import type { action } from '~/routes/circulars._archive._index/route'
import { getEventTypeFromSlug } from '~/routes/circulars/circulars.lib'
import { type CircularMetadata } from '~/routes/circulars/circulars.lib'

export async function loader({ params, request: { url } }: LoaderFunctionArgs) {
  if (!feature('EVENTTYPE')) {
    return redirect('/circulars')
  }
  const { searchParams } = new URL(url)
  const query = searchParams.get('query') || undefined
  const view = searchParams.get('view') || 'index'

  if (query && view === 'index') {
    await circularRedirect(query)
  }

  const { eventType: eventTypeSlug } = params

  const resolvedEventType = eventTypeSlug
    ? getEventTypeFromSlug(eventTypeSlug)
    : undefined

  if (!resolvedEventType) {
    return redirect('/circulars')
  }

  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)
  const sort = searchParams.get('sort') || 'circularId'
  const searchFunction = search
  const results = await searchFunction({
    query,
    page: page - 1,
    limit,
    startDate,
    endDate,
    sort,
    resolvedEventType,
  })
  const requestedChangeCount = (await getChangeRequests()).length

  return json(
    {
      page,
      ...results,
      requestedChangeCount,
      limit,
      eventTypeSlug,
      resolvedEventType,
    },
    { headers: getCanonicalUrlHeaders(new URL(`/circulars`, origin)) }
  )
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const defaultTitle = 'GCN - Circulars'
  const eventType = data?.resolvedEventType
  const eventTypeTitle =
    typeof eventType === 'string'
      ? eventType
      : (eventType as any)?.name || data?.eventTypeSlug

  return [
    {
      title: eventTypeTitle
        ? `GCN - ${eventTypeTitle.toUpperCase()} Circulars`
        : defaultTitle,
    },
  ]
}

export default function () {
  const result = useActionData<typeof action>()
  const {
    items,
    page,
    totalPages,
    totalItems,
    queryFallback,
    requestedChangeCount,
    limit,
    resolvedEventType,
  } = useLoaderData<typeof loader>()

  // Concatenate items from the action and loader functions
  const allItems = [
    ...(result?.newCircular ? [result.newCircular] : []),
    ...(items || []),
  ]

  const formId = useId()
  const [searchParams] = useSearchParams()

  // Strip off the ?index param if we navigated here from a form.
  // See https://remix.run/docs/en/main/guides/index-query-param.
  searchParams.delete('index')

  const query = searchParams.get('query') || ''
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const view = searchParams.get('view') || 'index'

  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  const [inputQuery, setInputQuery] = useState(query)
  const clean = inputQuery === query

  return (
    <>
      <ArchiveHeader
        result={result}
        requestedChangeCount={requestedChangeCount}
        formId={formId}
        inputQuery={inputQuery}
        setInputQuery={setInputQuery}
        queryFallback={queryFallback}
        eventType={resolvedEventType}
      />

      {clean && (
        <>
          <ArchiveIndex
            allItems={allItems as CircularMetadata[]}
            searchString={searchString}
            totalItems={totalItems}
            query={query}
          />

          <PaginationSelectionFooter
            query={query}
            startDate={startDate}
            endDate={endDate}
            page={page}
            limit={limit}
            totalPages={totalPages}
            form={formId}
            view={view}
          />
        </>
      )}
    </>
  )
}
