/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import { TokenSet } from 'openid-client'
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
  const accessToken = session.get('accessToken') as string
  if (!sub) return null
  const user = {
    sub,
    email,
    groups,
    idp,
    refreshToken,
    cognitoUserName,
    accessToken,
  }
  if (!accessToken) await refreshUser(user)

  const tokenSet = new TokenSet(
    JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
  )
  if (tokenSet.expired()) await refreshUser(user)

  return user
}

export async function updateSession(user: any) {
  const session = await storage.getSession()
  Object.entries(user).forEach(([key, value]) => {
    session.set(key, value)
  })
  await storage.commitSession(session)
}

// Clear the access tokens from all sessions belonging to the user with the given sub, to force them to get new access tokens.
export async function clearUserToken(sub: string) {
  const db = await tables()
  const targetSessionResults = await db.sessions.query({
    IndexName: 'sessionsBySub',
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
      UpdateExpression: 'REMOVE accessToken',
    })
  )

  await Promise.all(promises)
}
