/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import { refreshUser } from '~/lib/utils'
import { storage } from './auth.server'

export async function getUser({ headers }: Request) {
  const session = await storage.getSession(headers.get('Cookie'))
  const sub = session.get('sub') as string | null
  const email = session.get('email') as string
  const groups = session.get('groups') as string[]
  const idp = session.get('idp') as string | null
  const refreshToken = session.get('refreshToken') as string
  const cognitoUserName = session.get('cognitoUserName') as string
  const token = session.get('token') as string
  if (!sub) return null
  const user = { sub, email, groups, idp, refreshToken, cognitoUserName, token }
  if (
    !token ||
    JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp *
      1000 <
      Date.now()
  ) {
    await refreshUser(user)
  }
  return user
}

export async function updateSession(user: any) {
  const session = await storage.getSession()
  Object.entries(user).forEach(([key, value]) => {
    session.set(key, value)
  })
  await storage.commitSession(session)
}

export async function clearUserToken(sub: string) {
  const db = await tables()
  const targetSessionResults = await db.sessions.query({
    IndexName: 'bySub',
    KeyConditionExpression: '#sub = :sub',
    ExpressionAttributeNames: {
      '#sub': 'sub',
      '#idx': '_idx',
    },
    ExpressionAttributeValues: {
      ':sub': sub,
    },
    ProjectionExpression: '#idx',
  })

  if (!targetSessionResults.Items) return

  const promises = targetSessionResults.Items.map((item) =>
    db.sessions.update({
      Key: { _idx: item['_idx'] as string },
      UpdateExpression: 'set #token = :nullToken',
      ExpressionAttributeNames: {
        '#token': 'token',
      },
      ExpressionAttributeValues: {
        ':nullToken': null,
      },
    })
  )

  await Promise.all(promises)
}
