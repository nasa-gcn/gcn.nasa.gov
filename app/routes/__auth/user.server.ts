/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import type { Session } from '@remix-run/node'
import { TokenSet } from 'openid-client'
import { getOpenIDClient, storage } from './auth.server'

export interface User {
  sub: string
  email: string
  idp: string | null
  groups: string[]
  cognitoUserName: string
  name: string | undefined
  affiliation: string | undefined
}

export function parseTokenSet(tokenSet: TokenSet): {
  user: User
  accessToken: string | undefined
  refreshToken: string | undefined
  expiresAt: number | undefined
  existingIdp: string | undefined
} {
  const claims = tokenSet.claims()
  // NOTE: The OpenID Connect spec cautions that `sub` and `iss` together are
  // required to uniquely identify an end user.
  //
  // However, we are using a single identity provider (Cognito) which will
  // always return the same `iss` claim (identifying the Cognito user pool).
  // So it is safe in our application to use `sub` alone to identify users in
  // in our database.
  //
  // It does not matter that Cognito is federating several third-party IdPs;
  // Cognito returns the same `iss` for every single user.
  //
  // If we ever switched from Cognito to a different IdP, or if we ever
  // directly supported multiple IdPs at the application level, then we would
  // need to revisit this design decision and consider using a concatenation of
  // `sub` and `iss` to identify users.
  //
  // See https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability
  const { sub, email, 'cognito:username': cognitoUserName } = claims
  const idp =
    claims.identities instanceof Array && claims.identities.length > 0
      ? (claims.identities[0].providerName as string)
      : null
  const groups = ((claims['cognito:groups'] ?? []) as string[]).filter(
    (group) => group.startsWith('gcn.nasa.gov/')
  )
  const name = claims.name ?? ''
  const affiliation = (claims['custom:affiliation'] ?? '') as string
  const accessToken = tokenSet.access_token
  const refreshToken = tokenSet.refresh_token
  const expiresAt = tokenSet.expires_at
  const existingIdp = claims['dev:custom:existingIdp'] as string | undefined

  if (!email) throw new Error('email claim must be present')
  if (typeof cognitoUserName !== 'string')
    throw new Error('cognito:username claim must be a string')

  const user = { sub, email, groups, idp, cognitoUserName, name, affiliation }
  return { user, accessToken, refreshToken, expiresAt, existingIdp }
}

export async function getUser({ headers }: Request) {
  const session = await storage.getSession(headers.get('Cookie'))
  const expires_at = session.get('expiresAt')

  if (new TokenSet({ expires_at }).expired()) {
    const refreshToken = session.get('refreshToken')
    if (!refreshToken)
      throw new Error('No refresh token, cannot refresh session')
    return await refreshUser(refreshToken, session)
  } else {
    const user = Object.fromEntries(
      [
        'sub',
        'email',
        'groups',
        'idp',
        'cognitoUserName',
        'name',
        'affiliation',
      ].map((key) => [key, session.get(key)])
    )
    if (user.sub) return user as User
  }
}

/**
 * Gets the current session, sets the value for each key in provided user, and returns the Set-Cookie header
 */
export async function updateSession(
  {
    user,
    accessToken,
    refreshToken,
    expiresAt,
  }: ReturnType<typeof parseTokenSet>,
  session: Session
) {
  if (accessToken) session.set('accessToken', accessToken)
  if (refreshToken) session.set('refreshToken', refreshToken)
  if (expiresAt) session.set('expiresAt', expiresAt)
  Object.entries(user).forEach(([key, value]) => {
    session.set(key, value)
  })
  return await storage.commitSession(session)
}

// Expire tokens from all sessions belonging to the user with the given sub, to force them to get new tokens.
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
      UpdateExpression: 'SET expiresAt = :expiresAtValue',
      ExpressionAttributeValues: {
        ':expiresAtValue': null,
      },
    })
  )

  await Promise.all(promises)
}

// Refreshes a given users groups and tokens
export async function refreshUser(refreshToken: string, session: Session) {
  const client = await getOpenIDClient()
  const tokenSet = await client.refresh(refreshToken)
  const parsedTokenSet = parseTokenSet(tokenSet)
  await updateSession(parsedTokenSet, session)
  return parsedTokenSet.user
}
