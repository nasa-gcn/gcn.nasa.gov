/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs } from '@remix-run/node'
import { NavLink, Outlet } from '@remix-run/react'
import { GridContainer, SideNav } from '@trussworks/react-uswds'

import { getUser } from './_auth/user.server'
import type { PermissionType } from '~/lib/kafka.server'
import {
  adminGroup,
  createKafkaACL,
  deleteKafkaACL,
  updateDbFromBrokers,
} from '~/lib/kafka.server'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  if (intent === 'migrateFromBroker') {
    await updateDbFromBrokers(user)
    return null
  }
  const topicName = getFormDataString(data, 'topicName')
  const permissionType = getFormDataString(
    data,
    'permissionType'
  ) as PermissionType
  const group = getFormDataString(data, 'group')
  const includePrefixed = getFormDataString(data, 'includePrefixed')
  if (!topicName || !permissionType || !group)
    throw new Response(null, { status: 400 })
  const promises = []

  switch (intent) {
    case 'delete':
      promises.push(
        deleteKafkaACL(user, {
          topicName,
          permissionType,
          group,
          prefixed: false,
        })
      )
      break
    case 'create':
      promises.push(
        createKafkaACL(user, {
          topicName,
          permissionType,
          group,
          prefixed: false,
        })
      )

      if (includePrefixed)
        promises.push(
          createKafkaACL(user, {
            topicName: `${topicName}.`,
            permissionType,
            group,
            prefixed: true,
          })
        )
      break
    default:
      break
  }
  await Promise.all(promises)

  return null
}

export default function Kafka() {
  return (
    <GridContainer className="usa-section">
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-3">
          <SideNav
            items={[
              <NavLink key="kafka" to="kafka" end>
                Kafka
              </NavLink>,
            ]}
          />
        </div>
        <div className="desktop:grid-col-9">
          <Outlet />
        </div>
      </div>
    </GridContainer>
  )
}
