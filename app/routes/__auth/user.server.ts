/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import { TokenSet } from 'openid-client'
import { getOpenIDClient, storage } from './auth.server'
import { userFromTokenSet } from './login'
import * as jose from 'jose'

export async function getUser({ headers }: Request) {
  const session = await storage.getSession(headers.get('Cookie'))
  const sub = session.get('sub') as string | null
  const email = session.get('email') as string
  const groups = session.get('groups') as string[]
  const idp = session.get('idp') as string | null
  const refreshToken = session.get('refreshToken') as string
  const cognitoUserName = session.get('cognitoUserName') as string
  const accessToken = session.get('accessToken')
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

  const tokenSet = new TokenSet(jose.decodeJwt(accessToken))

  if (tokenSet.expired()) await refreshUser(user)

  return user
}

/**
 * Gets the current session, sets the value for each key in provided user, and returns the Set-Cookie header
 */
export async function updateSession(
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>
) {
  const session = await storage.getSession()
  Object.entries(user).forEach(([key, value]) => {
    session.set(key, value)
  })

  const setCookie = await storage.commitSession(session)
  return setCookie
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

// Refreshes a given users groups and access token
export async function refreshUser(
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>
) {
  const client = await getOpenIDClient()
  const refreshedTokenSet = await client.refresh(user.refreshToken)
  const user_new = userFromTokenSet(refreshedTokenSet)
  await updateSession(user_new)
  user.groups = user_new.groups
  user.accessToken = user_new.accessToken
}
