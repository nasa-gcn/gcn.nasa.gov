/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Authentication backend for GCN.
//
// The overall procedure is:
//
// 1. Complete OIDC authorization code flow with Cognito to get a secure JWT
//    for the user.
//
// 2. Generate a unique and stable string to identify the user which serves
//    as the primary key that identifies the user in our database. This key is
//    called "subiss" and it is a combination of the "sub" and "iss" claims
//    from the JWT. To convert it to a string, it is serialized as an unsecure
//    JWT.
//
// 3. Store the following in the session:
//    - subiss
//    - the user's email address (shown in page header)
//    - the user's group memberships (needed for client credential vending machine)

import { redirect } from '@remix-run/node'
import { createArcTableSessionStorage } from '@remix-run/architect'
import memoizee from 'memoizee'
import { UnsecuredJWT } from 'jose'
import { generators, Issuer } from 'openid-client'

function getEnvOrDie(key: string) {
  const result = process.env[key]
  if (!result) throw new Error(`environment variable ${key} must be set`)
  return result
}

// Short-lived session for storing the OIDC state and PKCE code verifier
const oidcStorage = createArcTableSessionStorage({
  cookie: {
    name: 'session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [getEnvOrDie('SESSION_SECRET')],
    sameSite: 'lax',
    path: '/',
    maxAge: 60,
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
    secrets: [getEnvOrDie('SESSION_SECRET')],
    sameSite: 'lax',
    path: '/',
    maxAge: 3600,
    httpOnly: true,
  },
  table: 'sessions',
  idx: '_idx',
  ttl: '_ttl',
})

function getAuthRedirectUri(request: Request) {
  const url = new URL(request.url)
  return `${url.origin}/auth`
}

function getLogoutRedirectUri(request: Request) {
  const url = new URL(request.url)
  return `${url.origin}/logout`
}

const getOpenIDClient = memoizee(
  async function () {
    const user_pool_id = getEnvOrDie('COGNITO_USER_POOL_ID')

    const providerUrl = `https://cognito-idp.${
      user_pool_id.split('_')[0]
    }.amazonaws.com/${user_pool_id}/`

    const issuer = await Issuer.discover(providerUrl)

    return new issuer.Client({
      client_id: getEnvOrDie('OIDC_CLIENT_ID'),
      client_secret: getEnvOrDie('OIDC_CLIENT_SECRET'),
      response_types: ['code'],
    })
  },
  { promise: true }
)

export async function login(request: Request) {
  const [client, { cookie, ...props }] = await Promise.all([
    getOpenIDClient(),
    (async () => {
      const oidcSessionPromise = oidcStorage.getSession()

      const nonce = generators.nonce()
      const state = generators.state()
      const code_verifier = generators.codeVerifier()
      const code_challenge = generators.codeChallenge(code_verifier)

      const oidcSession = await oidcSessionPromise
      oidcSession.set('code_verifier', code_verifier)
      oidcSession.set('nonce', nonce)
      oidcSession.set('state', state)

      const cookie = await oidcStorage.commitSession(oidcSession)

      return { cookie, nonce, state, code_challenge }
    })(),
  ])

  const authorizationUrl = client.authorizationUrl({
    scope: 'openid',
    code_challenge_method: 'S256',
    redirect_uri: getAuthRedirectUri(request),
    ...props,
  })

  return redirect(authorizationUrl, { headers: { 'Set-Cookie': cookie } })
}

export async function authorize(request: Request) {
  const sessionPromise = await storage.getSession()
  const [client, { oidcSessionDestroyPromise, ...checks }] = await Promise.all([
    getOpenIDClient(),
    (async () => {
      const cookie = request.headers.get('Cookie')
      const oidcSession = await oidcStorage.getSession(cookie)
      const code_verifier = oidcSession.get('code_verifier')
      const nonce = oidcSession.get('nonce')
      const state = oidcSession.get('state')
      if (!code_verifier || !nonce || !state)
        throw new Response(
          'Your session timed out. Please try logging in again.',
          { status: 400 }
        )
      const oidcSessionDestroyPromise = oidcStorage.destroySession(oidcSession)
      return { oidcSessionDestroyPromise, code_verifier, nonce, state }
    })(),
  ])

  const url = new URL(request.url)
  const params = client.callbackParams(url.search)
  const tokenSet = await client.callback(
    getAuthRedirectUri(request),
    params,
    checks
  )
  const claims = tokenSet.claims()

  const groups = ((claims['cognito:groups'] ?? []) as string[]).filter(
    (group) => group.startsWith('gcn.nasa.gov')
  )
  const subiss = new UnsecuredJWT({ sub: claims.sub, iss: claims.iss })
  const session = await sessionPromise
  session.set('subiss', subiss.encode())
  session.set('email', claims.email)
  session.set('groups', groups)

  const [cookie] = await Promise.all([
    storage.commitSession(session),
    oidcSessionDestroyPromise,
  ])

  return redirect('/', { headers: { 'Set-Cookie': cookie } })
}

export async function getLogoutURL(request: Request) {
  const client = await getOpenIDClient()

  // Determine the Cognito logout URI endpoint
  const auth_endpoint = client.issuer.metadata.authorization_endpoint
  if (!auth_endpoint)
    throw new Error(
      'client.issuer.metadata.authorization_endpoint must be present'
    )
  const url = new URL(auth_endpoint)
  url.pathname = '/logout'

  url.searchParams.set('client_id', getEnvOrDie('OIDC_CLIENT_ID'))
  url.searchParams.set('logout_uri', getLogoutRedirectUri(request))

  return url.toString()
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}
