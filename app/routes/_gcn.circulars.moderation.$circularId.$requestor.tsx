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
import * as Diff from 'diff'

import { getUser } from './_gcn._auth/user.server'
import {
  approveChangeRequest,
  deleteChangeRequest,
  get,
  getChangeRequest,
  moderatorGroup,
} from './_gcn.circulars/circulars.server'
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
      <h3>Subject</h3>
      <DiffedContent
        oldString={circular.subject}
        newString={correction.subject}
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

function DiffedContent({
  oldString,
  newString,
}: {
  oldString: string
  newString: string
}) {
  const diff = Diff.diffWords(oldString, newString)

  return (
    <div>
      <pre>
        <code>
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
