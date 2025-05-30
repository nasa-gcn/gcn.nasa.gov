/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  AdminGetUserCommand,
  type AttributeType,
} from '@aws-sdk/client-cognito-identity-provider'
import type { ActionFunctionArgs } from '@remix-run/node'
import type * as jose from 'jose'
import invariant from 'tiny-invariant'

import { getOpenIDClient } from './_auth/auth.server'
import { type User, parseGroups, parseIdp } from './_auth/user.server'
import {
  moderatorGroup,
  put,
  putVersion,
  submitterGroup,
  validateCircular,
} from './circulars/circulars.server'
import {
  cognito,
  extractAttribute,
  extractAttributeRequired,
  getUserGroupStrings,
} from '~/lib/cognito.server'
import { getEnvOrDie } from '~/lib/env.server'

// FIXME: BaseClient.validateJWT is non-private but undocumented.
// openid-client doesn't provide a type for it.
declare module 'openid-client' {
  interface BaseClient {
    validateJWT(
      jwt: string,
      expectedAlg: string,
      required?: string[]
    ): Promise<{
      payload: any
      protected: jose.CompactJWSHeaderParameters
      key: jose.JWK
    }>
  }
}

/** Get the bearer token from an HTTP request. */
function getBearer(request: Request) {
  return request.headers.get('Authorization')?.match(/^Bearer (.*)$/)?.[1]
}

/**
 * Validate and parse an access token from Cognito.
 *
 * Note that access tokens are usually supposed to be opaque, so this is not
 * portable to other IdPs.
 */
async function parseAccessToken(jwt: string): Promise<{
  iss: string
  sub: string
  exp: string
  iat: string
  scope: string
  username: string
}> {
  const client = await getOpenIDClient()
  const alg = client.metadata.authorization_signed_response_alg
  invariant(alg)

  const { payload } = await client.validateJWT(jwt, alg, [
    'iss',
    'sub',
    'exp',
    'iat',
    'scope',
    'username',
  ])
  return payload
}

function extractIdp(attrs: AttributeType[]) {
  const identities = extractAttribute(attrs, 'identities')
  if (!identities) return null
  return parseIdp(JSON.parse(identities))
}

async function getUserAttributes(Username: string) {
  const UserPoolId = getEnvOrDie('COGNITO_USER_POOL_ID')

  const { UserAttributes } = await cognito.send(
    new AdminGetUserCommand({
      UserPoolId,
      Username,
    })
  )
  invariant(UserAttributes)

  return {
    affiliation: extractAttribute(UserAttributes, 'custom:affiliation'),
    email: extractAttributeRequired(UserAttributes, 'email'),
    idp: extractIdp(UserAttributes),
    name: extractAttribute(UserAttributes, 'name'),
    existingIdp: extractAttribute(UserAttributes, 'dev:custom:existingIdp'),
  }
}

/**
 * Here's how this works.
 *
 * 1. We configure a Cognito user pool [app client] for the third party.
 *    The app client should have the following settings:
 *
 *    - Confidential client
 *    - Generate a client secret
 *    - Authentication flows: ALLOW_USER_SRP_AUTH
 *    - Refresh token expiration: TBD, determines how often the third party
 *      needs to "renew" permission for user account linking
 *    - Allowed callback URLs: must be provided by the third party
 *    - Identity providers: select all
 *    - OpenID Connect Scopes: Phone, Email, OpenID, Profile. Do NOT select
 *      aws.cognito.signin.user.admin.
 *    - Custom scopes: gcn.nasa.gov/circular-submitter
 *    - Attribute read and write permissions: turn on all
 *
 * 2. We send the client ID, client secret, and OIDC autodiscovery URL to the
 *    third party. The client secret must be encrypted.
 *
 * 3. In order to link an account for posting GCN Circulars, the third party's
 *    application does the following:
 *
 *    a. Do the [authorization code flow] to sign the user in with GCN's IdP.
 *       When requesting the authorization endpoint, be sure to request
 *       scope="openid profile gcn.nasa.gov/circular-submitter". (Note: the
 *       name of the last scope may change in the future.)
 *
 *    b. For now, if resulting ID token contains the 'existingIdp' claim, then
 *       the third party MUST redo the authentication code flow passing the
 *       query string parameter identity_provider=${existingIdp} to the
 *       authorization endpoint. GCN's IdP uses this claim to mark accounts
 *       that have email addresses that have already been used before by a
 *       different account from a different federated IdP (i.e., a Google user
 *       who is attempting to sign in with username and password).
 *
 *    c. Save the resulting refresh token and auth token on the server side in
 *       a record associated with the user's account.
 *
 *    e. The application is responsible for renewing the access token as needed
 *       using the refreshing token.
 *
 * [app client]: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html
 * [authorization code flow]: https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow
 *
 * METHOD: POST
 * GCN Circulars submission by third parties on behalf of users via an API.
 * To post a GCN Circular on behalf of the user, make a POST request to
 *       https://<stage>.gcn.nasa.gov/api/circulars. Provide the access token
 *       in the Authorization: Bearer header. The request body should be a JSON
 *       document of the form '{"subject": "...", "body": "..."}'.
 *
 * METHOD: PUT
 * GCN Circulars edit by moderators via the API.
 * To edit a GCN Circular as a moderator, make a PUT request to
 *       https://<stage>.gcn.nasa.gov/api/circulars. Provide the access token
 *       in the Authorization: Bearer header. The request body should be a JSON
 *       document of the form '{"subject": "...", "body": "..."}'.
 * Edits may be made to the subject, body, or eventId.
 * The subject and body are required, even if no changes are made.
 * EventId is optional.
 * A new circular version will be created.
 */
export async function action({ request }: ActionFunctionArgs) {
  if (!['PUT', 'POST'].includes(request.method))
    throw new Response(null, { status: 405 })

  const bearer = getBearer(request)
  if (!bearer) throw new Response('Bearer missing', { status: 403 })

  const {
    username: cognitoUserName,
    sub,
    scope,
  } = await parseAccessToken(bearer)

  // Make sure that the access token contains the required scope for this API
  switch (request.method) {
    case 'POST':
      if (!scope.split(' ').includes(submitterGroup))
        throw new Response('Invalid scope', { status: 403 })

    case 'PUT':
      if (!scope.split(' ').includes(moderatorGroup))
        throw new Response('Invalid scope', { status: 403 })
  }

  const [{ existingIdp, ...attrs }, groups] = await Promise.all([
    getUserAttributes(cognitoUserName),
    getUserGroupStrings(cognitoUserName),
  ])
  if (existingIdp) throw new Response('Wrong IdP', { status: 400 })

  const user: User = {
    sub,
    cognitoUserName,
    groups: parseGroups(groups),
    ...attrs,
  }

  const { subject, body, format, eventId, circularId } = await request.json()
  if (
    !(
      typeof subject === 'string' &&
      typeof body === 'string' &&
      (format === undefined || typeof format === 'string')
    )
  )
    throw new Response('missing required parameter', { status: 400 })

  switch (request.method) {
    case 'POST':
      const circular = {
        submittedHow: 'api',
        subject,
        body,
        eventId,
        ...(format ? { format } : {}),
      } as const

      return await put(circular, user)

    case 'PUT':
      const circularVersion = {
        circularId,
        subject,
        body,
        eventId,
      }

      validateCircular(circularVersion)

      return await putVersion(circularVersion, user)

    default:
      throw new Error('this code should not be reached')
  }
}
