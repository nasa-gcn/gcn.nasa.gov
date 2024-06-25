/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { Button, Checkbox } from '@trussworks/react-uswds'
import { useState } from 'react'

import { getUser } from './_auth/user.server'
import {
  addUserToGroup,
  allGroupNames,
  getCognitoUserFromSub,
  listGroupsForUser,
  removeUserFromGroup,
} from '~/lib/cognito.server'

export async function loader({
  params: { userId },
  request,
}: LoaderFunctionArgs) {
  const currentUser = await getUser(request)
  if (!currentUser?.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })
  if (!userId) throw new Response(null, { status: 404 })
  const user = await getCognitoUserFromSub(userId)
  if (!user.Username) throw new Response(null, { status: 400 })
  const userGroups = (await listGroupsForUser(user.Username)).map(
    (group) => group.GroupName
  )
  const allGroups = await allGroupNames()
  return { user, allGroups, userGroups }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const { Username, ...selectedGroups } = Object.fromEntries(data)
  if (!Username) throw new Response(null, { status: 400 })
  const currentUserGroups = (await listGroupsForUser(Username.toString())).map(
    (x) => x.GroupName
  ) as string[]
  const selectedGroupsNames = Object.keys(selectedGroups)

  await Promise.all([
    ...selectedGroupsNames
      .filter((x) => !currentUserGroups.includes(x))
      .map((x) => addUserToGroup(Username.toString(), x)),
    ...currentUserGroups
      .filter((x) => !selectedGroupsNames.includes(x))
      .map((x) => removeUserFromGroup(Username.toString(), x)),
  ])

  return null
}

export default function () {
  const { user, allGroups, userGroups } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  return (
    <>
      <h1>Manage User Settings</h1>
      {user.Attributes?.find((x) => x.Name == 'email')?.Value}
      <h2>Groups</h2>
      <fetcher.Form method="POST">
        <input
          type="hidden"
          name="Username"
          id="Username"
          value={user.Username}
        />
        {allGroups.map(
          (groupName) =>
            groupName && (
              <div key={groupName}>
                <GroupsCheckbox userGroups={userGroups} groupName={groupName} />
              </div>
            )
        )}
        <Button type="submit">Save</Button>
      </fetcher.Form>
    </>
  )
}

function GroupsCheckbox({
  userGroups,
  groupName,
}: {
  userGroups: string[]
  groupName: string
}) {
  const [checked, setChecked] = useState(userGroups.includes(groupName))

  return (
    <Checkbox
      id={groupName}
      name={groupName}
      label={groupName}
      checked={checked}
      onChange={() => setChecked(!checked)}
    />
  )
}
