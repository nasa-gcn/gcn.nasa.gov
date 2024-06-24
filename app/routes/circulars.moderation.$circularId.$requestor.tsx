/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, redirect, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup } from '@trussworks/react-uswds'
import { diffLines, diffWords } from 'diff'

import { getUser } from './_auth/user.server'
import {
  approveChangeRequest,
  deleteChangeRequest,
  get,
  getChangeRequest,
  moderatorGroup,
} from './circulars/circulars.server'
import { dateTimeFormat } from '~/components/TimeAgo'
import { getFormDataString } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle<typeof loader> & SEOHandle = {
  breadcrumb({ data }) {
    if (data) {
      return `${data.circular.circularId}`
    }
  },
  getSitemapEntries: () => null,
}

export async function action({
  request,
  params: { circularId, requestor },
}: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  if (!intent || !circularId || !requestor)
    throw new Response(null, { status: 400 })
  switch (intent) {
    case 'approve':
      await approveChangeRequest(parseFloat(circularId), requestor, user)
      break
    case 'reject':
      await deleteChangeRequest(parseFloat(circularId), requestor, user)
      break
    default:
      break
  }
  return redirect('/circulars/moderation')
}

export async function loader({
  request,
  params: { circularId, requestor },
}: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  if (!circularId || !requestor) throw new Response(null, { status: 400 })
  const circular = await get(parseFloat(circularId))
  const correction = await getChangeRequest(parseFloat(circularId), requestor)
  return { circular, correction }
}

export default function () {
  const { circular, correction } = useLoaderData<typeof loader>()
  return (
    <>
      <h2>Circular {circular.circularId}</h2>
      <h3>Original Author</h3>
      <DiffedContent
        oldString={circular.submitter}
        newString={correction.submitter}
      />
      <h3>Requestor</h3>
      {correction.requestor}
      <h3>Created On</h3>
      <DiffedContent
        oldString={dateTimeFormat.format(circular.createdOn)}
        newString={dateTimeFormat.format(correction.createdOn)}
        method="lines"
      />
      <h3>Subject</h3>
      <DiffedContent
        oldString={circular.subject}
        newString={correction.subject}
      />
      <h3>Format</h3>
      <DiffedContent
        oldString={circular.format ?? 'text/plain'}
        newString={correction.format ?? 'text/plain'}
      />
      <h3>Body</h3>
      <DiffedContent oldString={circular.body} newString={correction.body} />
      <Form method="POST">
        <ButtonGroup>
          <Button type="submit" name="intent" value="approve">
            Approve
          </Button>
          <Button type="submit" name="intent" value="reject" secondary>
            Reject
          </Button>
        </ButtonGroup>
      </Form>
    </>
  )
}

const methodMap = {
  words: diffWords,
  lines: diffLines,
}

function DiffedContent({
  oldString,
  newString,
  method,
}: {
  oldString: string
  newString: string
  method?: 'words' | 'lines'
}) {
  const diff = methodMap[method && newString ? method : 'lines'](
    oldString ?? '',
    newString ?? ''
  )

  return (
    <div>
      <pre>
        <code className="text-pre-wrap">
          {diff.map((part, index) => (
            <span
              key={index}
              className={
                part.added
                  ? 'bg-success'
                  : part.removed
                    ? 'bg-secondary'
                    : 'bg-white'
              }
            >
              {part.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
