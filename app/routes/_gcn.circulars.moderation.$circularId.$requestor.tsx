/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, redirect, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup } from '@trussworks/react-uswds'
import { DiffMethod } from 'react-diff-viewer-continued'

import { getUser } from './_gcn._auth/user.server'
import type {
  Circular,
  CircularChangeRequest,
} from './_gcn.circulars/circulars.lib'
import {
  approveChangeRequest,
  deleteChangeRequest,
  get,
  getChangeRequest,
  moderatorGroup,
} from './_gcn.circulars/circulars.server'
import { getFormDataString } from '~/lib/utils'

const DiffViewer = require('react-diff-viewer-continued').default

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
      <Diff circular={circular} correction={correction} />
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

function Diff({
  circular,
  correction,
}: {
  circular: Circular
  correction: CircularChangeRequest
}) {
  return (
    <DiffViewer
      oldValue={circular.subject + '\n' + circular.body}
      newValue={correction.subject + '\n' + correction.body}
      splitView={false}
      hideLineNumbers
      compareMethod={DiffMethod.WORDS}
    />
  )
}
