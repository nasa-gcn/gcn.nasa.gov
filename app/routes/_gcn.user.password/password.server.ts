/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import {
  ChangePasswordCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { type DynamoDBDocument, paginateQuery } from '@aws-sdk/lib-dynamodb'

import { storage } from '../_gcn._auth/auth.server'
import { getUser } from '../_gcn._auth/user.server'
import { cognito } from '~/lib/cognito.server'

export async function updatePassword(
  request: Request,
  oldPassword: string,
  newPassword: string
) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const session = await storage.getSession(request.headers.get('Cookie'))
  const accessToken = session.get('accessToken')
  const passwordData = {
    AccessToken: accessToken,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword,
  }

  const command = new ChangePasswordCommand(passwordData)
  try {
    await cognito.send(command)
  } catch (error) {
    if (
      error instanceof Error &&
      ['NotAuthorizedException', 'LimitExceededException'].includes(error.name)
    ) {
      return error.name
    } else {
      throw error
    }
  }

  // Terminate all of the other sessions of this user.
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('sessions')
  const pages = await paginateQuery(
    { client, pageSize: 25 },
    {
      KeyConditionExpression: '#sub = :sub',
      FilterExpression: '#idx <> :idx',
      ExpressionAttributeNames: { '#sub': 'sub', '#idx': '_idx' },
      ExpressionAttributeValues: { ':sub': user.sub, ':idx': session.id },
      IndexName: 'sessionsBySub',
      TableName,
      ProjectionExpression: '#idx, refreshToken',
    }
  )
  for await (const { Items } of pages) {
    if (Items?.length) {
      await Promise.all([
        client.batchWrite({
          RequestItems: {
            [TableName]: Items.map(({ _idx }) => ({
              DeleteRequest: { Key: { _idx } },
            })),
          },
        }),
        ...Items.map(({ refreshToken }) =>
          cognito.send(new GlobalSignOutCommand({ AccessToken: refreshToken }))
        ),
      ])
    }
  }

  return null
}
