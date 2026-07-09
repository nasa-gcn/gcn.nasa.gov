/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { Button, Label } from '@trussworks/react-uswds'

import { getUser } from './_auth/user.server'
import { adminGroup } from './admin'
import { checkIndexStatus, updateIndexTable } from '~/lib/opensearch.server'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData()
  const index = getFormDataString(data, 'index')
  console.log(index)
  if (!index) throw new Response(null, { status: 400 })

  await updateIndexTable(index)
  return null
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const states = await checkIndexStatus()
  return {
    states,
  }
}

export default function () {
  const { states } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  return (
    <>
      <h1>OpenSearch</h1>
      <p>Manage OpenSearch indexes</p>
      {JSON.stringify(states)}
      <p>Trigger reindexing</p>
      <fetcher.Form method="POST">
        <Label htmlFor="index">Users</Label>
        <input type="hidden" name="index" value="users" />
        <Button type="submit" className="margin-y-1">
          Start
        </Button>
      </fetcher.Form>
      <fetcher.Form method="POST">
        <Label htmlFor="index">Circulars</Label>
        <input type="hidden" name="index" value="circulars" />
        <Button type="submit" className="margin-y-1">
          Start
        </Button>
      </fetcher.Form>
    </>
  )
}
