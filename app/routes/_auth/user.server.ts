/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { type DynamoDBDocument, paginateQuery } from '@aws-sdk/lib-dynamodb'
import type { Session } from '@remix-run/node'
import { TokenSet } from 'openid-client'

import { getOpenIDClient, storage } from './auth.server'
import { feature } from '~/lib/env.server'
import type { TeamPermission } from '~/lib/user.server'
import { getUserMetadata, getUsersKafkaPermissions } from '~/lib/user.server'

export interface User {
  sub: string
  email: string
  idp: string | null
  groups: string[]
  cognitoUserName: string
  name?: string | undefined
  affiliation?: string | undefined
  kafkaPermissions?: TeamPermission[]
}

export function parseIdp(identities: unknown) {
  if (!(identities instanceof Array)) return null
  const providerName = identities[0]?.providerName
  if (!(typeof providerName === 'string')) return null
  return providerName
}

export function parseGroups(groups?: string[]) {
  return (groups ?? []).filter((group) => group.startsWith('gcn.nasa.gov/'))
}

export function parseTokenSet(tokenSet: TokenSet): {
  user: User
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  existingIdp?: string
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
  const idp = parseIdp(claims.identities)
  const groups = parseGroups(claims['cognito:groups'] as string[] | undefined)
  const name = claims.name
  const affiliation = claims['affiliation'] as string | undefined
  const accessToken = tokenSet.access_token
  const refreshToken = tokenSet.refresh_token
  const expiresAt = tokenSet.expires_at
  const existingIdp = claims['existingIdp'] as string | undefined

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
      ]
        .map((key) => [key, session.get(key)])
        .filter(([, value]) => value !== undefined)
    )
    if (user.sub) {
      if (feature('TEAMS')) {
        const { username, affiliation, email } = await getUserMetadata(user.sub)
        user.name = username
        user.affiliation = affiliation
        user.email = email
        user.kafkaPermissions = await getUsersKafkaPermissions(user.sub)
      }
      return user as User
    }
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
    if (value !== undefined) session.set(key, value)
  })
  return await storage.commitSession(session)
}

// Expire tokens from all sessions belonging to the user with the given sub, to force them to get new tokens.
export async function clearUserToken(sub: string) {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const pages = paginateQuery(
    { client },
    {
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
      TableName: db.name('sessions'),
    }
  )

  for await (const { Items } of pages) {
    if (Items?.length) {
      await Promise.all(
        Items.map((item) =>
          db.sessions.update({
            Key: { _idx: item['_idx'] as string },
            UpdateExpression: 'SET expiresAt = :expiresAtValue',
            ExpressionAttributeValues: {
              ':expiresAtValue': null,
            },
          })
        )
      )
    }
  }
}

// Refreshes a given users groups and tokens
export async function refreshUser(refreshToken: string, session: Session) {
  const client = await getOpenIDClient()
  const tokenSet = await client.refresh(refreshToken)
  const parsedTokenSet = parseTokenSet(tokenSet)
  await updateSession(parsedTokenSet, session)
  return parsedTokenSet.user
}
