/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { createArcTableSessionStorage } from '@remix-run/architect'
import memoizee from 'memoizee'
import { Issuer } from 'openid-client'

import { getEnvOrDie, sessionSecret } from '~/lib/env.server'

// Short-lived session for storing the OIDC state and PKCE code verifier
export const oidcStorage = createArcTableSessionStorage({
  cookie: {
    name: 'session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    path: '/',
    maxAge: 300,
    httpOnly: true,
  },
  table: 'sessions',
  idx: '_idx',
  ttl: '_ttl',
})

// Long-lived user session. The cookie name is the same as the oidcStorage
// session, so the cookie replaces it (with a longer expiration time).
export const storage = createArcTableSessionStorage({
  cookie: {
    name: 'session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    path: '/',
    maxAge: 30 * 24 * 3600,
    httpOnly: true,
  },
  table: 'sessions',
  idx: '_idx',
  ttl: '_ttl',
})

export const getOpenIDClient = memoizee(
  async function () {
    const user_pool_id = process.env.COGNITO_USER_POOL_ID

    let providerUrl, isCognito
    if (user_pool_id) {
      providerUrl = `https://cognito-idp.${
        user_pool_id.split('_')[0]
      }.amazonaws.com/${user_pool_id}/`
      isCognito = true
    } else if (process.env.ARC_ENV === 'testing') {
      providerUrl = `http://localhost:${process.env.ARC_OIDC_IDP_PORT}/`
    } else {
      throw new Error(
        'Environment variable COGNITO_USER_POOL_ID must be defined in production'
      )
    }
    const issuer = await Issuer.discover(providerUrl)
    // FIXME: Cognito supports RFC 7009 "Token Revocation", but it does not
    // advertise the token endpoint in its autodiscovery response.
    // Fill it in by hand.
    if (isCognito && !issuer.metadata.revocation_endpoint) {
      issuer.revocation_endpoint = issuer.metadata.revocation_endpoint =
        issuer.metadata.token_endpoint?.replace(
          '/oauth2/token',
          '/oauth2/revoke'
        )
    }

    return new issuer.Client({
      client_id: getEnvOrDie('OIDC_CLIENT_ID'),
      client_secret: getEnvOrDie('OIDC_CLIENT_SECRET'),
      response_types: ['code'],
    })
  },
  { promise: true }
)

/**
 * Returns an OpenID client that authorizes against the Public app client
 *
 * This client can only grant Kafka consumer and producer scope
 */
export async function getScopedOpenIDClient() {
  const user_pool_id = process.env.COGNITO_USER_POOL_ID
  if (!user_pool_id) throw new Response(null, { status: 400 })
  const providerUrl = `https://cognito-idp.${
    user_pool_id.split('_')[0]
  }.amazonaws.com/${user_pool_id}/`

  const issuer = await Issuer.discover(providerUrl)

  // FIXME: Cognito supports RFC 7009 "Token Revocation", but it does not
  // advertise the token endpoint in its autodiscovery response.
  // Fill it in by hand.
  if (!issuer.metadata.revocation_endpoint) {
    issuer.revocation_endpoint = issuer.metadata.revocation_endpoint =
      issuer.metadata.token_endpoint?.replace('/oauth2/token', '/oauth2/revoke')
  }

  return new issuer.Client({
    client_id: getEnvOrDie('PUBLIC_CLIENT_ID'),
    token_endpoint_auth_method: 'none',
    response_types: ['code'],
  })
}
