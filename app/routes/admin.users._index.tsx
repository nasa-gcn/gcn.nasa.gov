/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { Button, Label } from '@trussworks/react-uswds'
import { useState } from 'react'

import { getUser } from './_auth/user.server'
import UserLookupComboBox from '~/components/UserLookup'
import { getFormDataString } from '~/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })
  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData()
  const userSub = getFormDataString(data, 'userSub')
  return redirect(`/admin/users/${userSub}`)
}

export default function () {
  const [userSub, setUserSub] = useState('')
  return (
    <>
      <h1>Users</h1>
      <p>Manage users and their group associations</p>
      <Form method="POST">
        <Label htmlFor="emailFilter">Filter</Label>
        <input type="hidden" name="userSub" value={userSub} />
        <UserLookupComboBox
          onSelectedItemChange={({ selectedItem }) =>
            setUserSub(selectedItem?.sub ?? '')
          }
        />
        <Button type="submit" disabled={!userSub}>
          Edit
        </Button>
      </Form>
    </>
  )
}
