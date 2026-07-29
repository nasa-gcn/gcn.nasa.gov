/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Link,
  json,
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import { Alert } from '@trussworks/react-uswds'
import clamp from 'lodash/clamp'
import { useId, useState } from 'react'

import {
  circularRedirect,
  createChangeRequest,
  get,
  getChangeRequest,
  getChangeRequests,
  moderatorGroup,
  put,
  putVersion,
  search,
} from '../circulars/circulars.server'
import ArchiveHeader from './ArchiveHeader'
import ArchiveIndex from './ArchiveIndex'
import SynonymGroupIndex from './SynonymGroupIndex'
import PaginationSelectionFooter from '~/components/pagination/PaginationSelectionFooter'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'
import { getFormDataString } from '~/lib/utils'
import { postZendeskRequest } from '~/lib/zendesk.server'
import { usePermissionModerator } from '~/root'
import { getUser } from '~/routes/_auth/user.server'
import {
  type CircularFormat,
  type CircularMetadata,
  circularFormats,
} from '~/routes/circulars/circulars.lib'
import type { SynonymGroup } from '~/routes/synonyms/synonyms.lib'
import { searchSynonymsByEventId } from '~/routes/synonyms/synonyms.server'

export async function loader({ request: { url } }: LoaderFunctionArgs) {
  const { searchParams } = new URL(url)
  const query = searchParams.get('query') || undefined
  const view = searchParams.get('view') || 'index'
  const isGroupView = view === 'group'

  if (query && view === 'index') {
    await circularRedirect(query)
  }

  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)
  const sort = searchParams.get('sort') || 'circularId'
  const searchFunction = view != 'group' ? search : searchSynonymsByEventId
  const results = await searchFunction({
    query,
    page: page - 1,
    limit,
    startDate,
    endDate,
    sort,
  })
  const requestedChangeCount = (await getChangeRequests()).length

  return json(
    {
      page,
      ...results,
      requestedChangeCount,
      limit,
      isGroupView,
    },
    { headers: getCanonicalUrlHeaders(new URL(`/circulars`, origin)) }
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  const intent = getFormDataString(data, 'intent')
  const format = getFormDataString(data, 'format') as CircularFormat | undefined
  const eventId = getFormDataString(data, 'eventId') || undefined
  if (format && !circularFormats.includes(format)) {
    throw new Response('Invalid format', { status: 400 })
  }
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  const user = await getUser(request)
  const circularId = getFormDataString(data, 'circularId')
  let newCircular
  const props = { body, subject, eventId, ...(format ? { format } : {}) }
  switch (intent) {
    case 'correction':
      if (circularId === undefined)
        throw new Response('circularId is required', { status: 400 })

      if (!user?.email) throw new Response(null, { status: 403 })
      const name = user.name ?? user.email
      let submitter
      if (user.groups.includes(moderatorGroup)) {
        submitter = getFormDataString(data, 'submitter')
        if (!submitter) throw new Response(null, { status: 400 })
      }

      let zendeskTicketId: number | undefined

      try {
        zendeskTicketId = (
          await getChangeRequest(parseFloat(circularId), user.sub)
        ).zendeskTicketId
      } catch (err) {
        if (!(err instanceof Response && err.status === 404)) throw err
      }

      if (!zendeskTicketId) {
        zendeskTicketId = await postZendeskRequest({
          requester: { name, email: user.email },
          subject: `Change Request for Circular ${circularId}`,
          comment: {
            body: `${name} has requested an edit. Review at ${origin}/circulars`,
          },
        })
      }

      if (!zendeskTicketId) throw new Response(null, { status: 500 })

      await createChangeRequest(
        {
          circularId: parseFloat(circularId),
          ...props,
          submitter,
          zendeskTicketId,
          eventId,
        },
        user
      )
      newCircular = null
      break
    case 'edit':
      if (circularId === undefined)
        throw new Response('circularId is required', { status: 400 })

      await putVersion(
        {
          circularId: parseFloat(circularId),
          ...props,
        },
        user
      )
      newCircular = await get(parseFloat(circularId))
      break
    case 'new':
      newCircular = await put({ ...props, submittedHow: 'web' }, user)
      break
    default:
      break
  }
  return { newCircular, intent }
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
    isGroupView,
  } = useLoaderData<typeof loader>()

  // Concatenate items from the action and loader functions
  const allItems = [
    ...(result?.newCircular ? [result.newCircular] : []),
    ...(items || []),
  ]

  const formId = useId()
  const [searchParams] = useSearchParams()
  const userIsModerator = usePermissionModerator()

  // Strip off the ?index param if we navigated here from a form.
  // See https://remix.run/docs/en/main/guides/index-query-param.
  searchParams.delete('index')

  const query = searchParams.get('query') || ''
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const view = searchParams.get('view') || 'index'

  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  const [inputQuery] = useState(query)

  const clean = inputQuery === query

  return (
    <>
      {result?.intent === 'correction' && (
        <Alert
          type="success"
          headingLevel="h1"
          slim
          heading="Request Submitted"
        >
          Thank you for your correction. A GCN Circulars moderator will review
          it shortly.
        </Alert>
      )}

      {userIsModerator && requestedChangeCount > 0 && (
        <Link to="moderation" className="usa-button usa-button--outline">
          Review {requestedChangeCount} Requested Change
          {requestedChangeCount > 1 ? 's' : ''}
        </Link>
      )}
      {userIsModerator && (
        <Link to="/synonyms" className="usa-button usa-button--outline">
          Synonym Moderation
        </Link>
      )}

      <ArchiveHeader
        result={result}
        requestedChangeCount={requestedChangeCount}
        formId={formId}
        queryFallback={queryFallback}
      ></ArchiveHeader>

      {clean && (
        <>
          {isGroupView ? (
            <SynonymGroupIndex
              allItems={items as SynonymGroup[]}
              searchString={searchString}
              totalItems={totalItems}
              query={query}
            />
          ) : (
            <ArchiveIndex
              allItems={allItems as CircularMetadata[]}
              searchString={searchString}
              totalItems={totalItems}
              query={query}
            />
          )}

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
