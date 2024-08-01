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

import { getUser } from './_auth/user.server'
import {
  addUserToGroup,
  getCognitoUserFromSub,
  getGroups,
  listGroupsForUser,
  removeUserFromGroup,
} from '~/lib/cognito.server'

interface GroupSelectionItem {
  groupName: string
  selected: boolean
  description: string
}

export async function loader({
  params: { userId },
  request,
}: LoaderFunctionArgs) {
  const currentUser = await getUser(request)
  if (!currentUser?.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })
  if (!userId) throw new Response(null, { status: 404 })
  const user = await getCognitoUserFromSub(userId)
  const userGroups = (await listGroupsForUser(userId)).map(
    (group) => group.GroupName
  )
  const allGroups: GroupSelectionItem[] = (await getGroups())
    .map((x) => {
      return {
        groupName: x.GroupName ?? '',
        selected: userGroups.includes(x.GroupName),
        description: x.Description ?? '',
      }
    })
    .filter((x) => Boolean(x.groupName))
  return { user, allGroups }
}

export async function action({
  request,
  params: { userId },
}: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const { ...selectedGroups } = Object.fromEntries(data)
  if (!userId) throw new Response(null, { status: 400 })
  const currentUserGroups = (await listGroupsForUser(userId)).map(
    (x) => x.GroupName
  ) as string[]
  const selectedGroupsNames = Object.keys(selectedGroups)

  await Promise.all([
    ...selectedGroupsNames
      .filter((x) => !currentUserGroups.includes(x))
      .map((x) => addUserToGroup(userId, x)),
    ...currentUserGroups
      .filter((x) => !selectedGroupsNames.includes(x))
      .map((x) => removeUserFromGroup(userId, x)),
  ])

  return null
}

export default function () {
  const { user, allGroups } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  return (
    <>
      <h1>Manage User Settings</h1>
      {user.Attributes?.find((x) => x.Name == 'email')?.Value}
      <fetcher.Form method="POST">
        <h2>Groups</h2>
        {allGroups.map(({ groupName, description, selected }) => (
          <div key={groupName}>
            <GroupsCheckbox
              groupName={groupName}
              description={description}
              selected={selected}
            />
          </div>
        ))}
        <Button type="submit" disabled={fetcher.state === 'submitting'}>
          Save
        </Button>
      </fetcher.Form>
    </>
  )
}

function GroupsCheckbox({
  groupName,
  description,
  selected,
}: {
  groupName: string
  description: string
  selected: boolean
}) {
  return (
    <Checkbox
      id={groupName}
      name={groupName}
      label={groupName}
      defaultChecked={selected}
      labelDescription={description}
    />
  )
}
