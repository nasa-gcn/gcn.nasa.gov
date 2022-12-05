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

/**
 * Serialize OIDC `sub` and `iss` claims as a string.
 *
 * The returned string is suitable for use as a primary key or partition key in
 * a database to uniquely identify the end user.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability}
 * @example
 * // returns 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJmb28iLCJpc3MiOiJiYXIifQ.'
 * subiss({sub: 'foo', iss: 'bar'})
 *
 */
export function subiss(params: { sub: string; iss: string }) {
  return new jose.UnsecuredJWT(params).encode()
}

export async function getUser({ headers }: Request) {
  const session = await storage.getSession(headers.get('Cookie'))
  const subiss = session.get('subiss') as string | null
  const email = session.get('email') as string
  const groups = session.get('groups') as string[]
  const idp = session.get('idp') as string | null
  const refreshToken = session.get('refreshToken') as string
  const cognitoUserName = session.get('cognitoUserName') as string
  const accessToken = session.get('accessToken')
  if (!subiss) return null
  const user = {
    subiss,
    email,
    groups,
    idp,
    cognitoUserName,
    accessToken,
  }
  if (!accessToken) await refreshUser(user, refreshToken)

  const tokenSet = new TokenSet(jose.decodeJwt(accessToken))

  if (tokenSet.expired()) await refreshUser(user, refreshToken)

  return user
}

/**
 * Gets the current session, sets the value for each key in provided user, and returns the Set-Cookie header
 */
export async function updateSession(
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  refreshToken: string
) {
  const session = await storage.getSession()
  session.set('refreshToken', refreshToken)
  Object.entries(user).forEach(([key, value]) => {
    session.set(key, value)
  })
  return await storage.commitSession(session)
}

// Clear the access tokens from all sessions belonging to the user with the given sub, to force them to get new access tokens.
export async function clearUserToken(subiss: string) {
  const db = await tables()
  const targetSessionResults = await db.sessions.query({
    IndexName: 'sessionsBySubiss',
    KeyConditionExpression: '#subiss = :subiss',
    ExpressionAttributeNames: {
      '#subiss': 'subiss',
      '#idx': '_idx',
    },
    ExpressionAttributeValues: {
      ':subiss': subiss,
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
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  refreshToken: string
) {
  const client = await getOpenIDClient()
  const refreshedTokenSet = await client.refresh(refreshToken)
  const updatedData = userFromTokenSet(refreshedTokenSet)
  await updateSession(updatedData.user, updatedData.refreshToken)
  user.groups = updatedData.user.groups
  user.accessToken = updatedData.user.accessToken
}
