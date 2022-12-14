/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, Label } from '@trussworks/react-uswds'
import { NoticeFormat } from '~/components/NoticeFormat'
import { NoticeTypeCheckboxes } from '~/components/NoticeTypeCheckboxes'

export const handle = {
  breadcrumb: 'GCN - Start Streaming GCN Notices - Customize Alerts',
}

export function loader({ request: { url } }: DataFunctionArgs) {
  const clientId = new URL(url).searchParams.get('clientId')
  if (!clientId) throw new Response('clientId expected', { status: 400 })
  return clientId
}

export default function Alerts() {
  const clientId = useLoaderData<typeof loader>()
  return (
    <Form method="get" action="../code">
      <p>
        Choose how you would like your results returned. Select a Format and
        Notice type for each alert you would like to subscribe to. More details
        on the Notice Types can be found their respective pages under{' '}
        <Link to="/missions">Missions</Link>.
      </p>
      <Label htmlFor="noticeFormat">Notice Format</Label>
      <NoticeFormat name="noticeFormat" value="text" />
      <Label htmlFor="noticeTypes">Notice Type</Label>
      <NoticeTypeCheckboxes />
      <input type="hidden" name="clientId" value={clientId} />
      <Link
        to="../credentials"
        type="button"
        className="usa-button usa-button--outline"
      >
        Back
      </Link>
      <Button type="submit">Generate Code</Button>
    </Form>
  )
}
