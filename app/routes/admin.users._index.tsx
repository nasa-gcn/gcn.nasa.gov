/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Label, Table, TextInput } from '@trussworks/react-uswds'
import { useState } from 'react'

import { getUser } from './_auth/user.server'
import { listUsers } from '~/lib/cognito.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })
  const users = await listUsers()
  return { users }
}

export default function () {
  const { users } = useLoaderData<typeof loader>()
  const [filterString, setFilterString] = useState('')

  const displayUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(filterString.toLowerCase()) ||
      user.name?.toLowerCase().includes(filterString.toLowerCase())
  )

  return (
    <>
      <h1>Users</h1>
      <p>Manage users and their group associations</p>
      <Label htmlFor="emailFilter">Filter</Label>
      <TextInput
        id="emailFilter"
        name="emailFilter"
        type="text"
        value={filterString}
        onChange={(event) => setFilterString(event.target.value)}
      />
      <Table stackedStyle="default" fullWidth>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {displayUsers &&
            displayUsers.map(
              (user) =>
                user.sub && (
                  <tr key={user.sub}>
                    <th>{user.email}</th>
                    <th>{user.name}</th>
                    <th>
                      <Link to={user.sub}>Edit</Link>
                    </th>
                  </tr>
                )
            )}
        </tbody>
      </Table>
    </>
  )
}
