/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import CircularsEditForm from '~/components/CircularsEditForm'
import { getLatestUserGroups } from '~/lib/utils'
import { getUser } from '~/routes/__auth/user.server'
import { EndorsementsServer } from '../user/endorsements.server'
import { storage } from '../__auth/auth.server'

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  const server = await EndorsementsServer.create(request)
  const existingRequest = await server.getUsersEndorsementStatus()
  if (
    existingRequest.status == 'approved' &&
    user?.groups.indexOf('gcn.nasa.gov/circular-submitter') == -1
  ) {
    try {
      await addUserToGroup(user)
      await getLatestUserGroups(user)
    } catch (e) {
      console.log('Adding fake permission')
      // This is throwing an error locally, is it the same as
      // the issue in client_credentials.server.ts (around line 170, 'maybeThrow...' )
      // Update: It is, going to use a similar 'fake it on local dev' strat
      const session = await storage.getSession()
      session.set('groups', [...user.groups, 'gcn.nasa.gov/circular-submitter'])
      user.groups = session.get('groups')
    }
  }
  console.log(user?.groups)
  return { user, existingRequest }
}

export default function Submit() {
  const { user, existingRequest } = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Submit a Circular</h1>
      {user?.groups &&
      user?.groups.indexOf('gcn.nasa.gov/circular-submitter') > -1 ? (
        <CircularsEditForm />
      ) : (
        <p>
          Your current endorsement status is:{' '}
          <strong>{existingRequest.status}</strong>. If you need to update your
          endorsement request, you may do so{' '}
          <Link
            type="button"
            className="usa-button--unstyled"
            to={'/user/circulars'}
          >
            here
          </Link>
          .
        </p>
      )}
    </>
  )
}

async function addUserToGroup(user: {
  sub: string
  email: string
  groups: string[]
  idp: string | null
  refreshToken: string
  cognitoUserName: string
}) {
  console.log('Cognito update here')
  const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({})
  const command = new AdminAddUserToGroupCommand({
    Username: user.cognitoUserName,
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    GroupName: 'gcn.nasa.gov/circular-submitter',
  })
  const response = await cognitoIdentityProviderClient.send(command)
  console.log(response)
}
