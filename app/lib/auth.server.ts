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

import { redirect } from 'remix'
// FIXME: Vendored from https://github.com/remix-run/remix/pull/1538
import { createArcTableSessionStorage } from './arcTableSessionStorage'
import { COGNITO_USER_POOL_ID } from './conf.server'
import memoizee from 'memoizee'
import { UnsecuredJWT } from 'jose'
import { generators, Issuer } from 'openid-client'

if (!process.env.SESSION_SECRET)
  throw new Error('environment variable SESSION_SECRET must be defined')

// Short-lived session for storing the OIDC state and PKCE code verifier
const oidcStorage = createArcTableSessionStorage({
  cookie: {
    name: 'session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.SESSION_SECRET],
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
    secrets: [process.env.SESSION_SECRET],
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
  // FIXME: Remove this line once the following issue is fixed.
  // https://github.com/remix-run/remix/issues/1536
  if (process.env.ARC_SANDBOX) url.protocol = 'http'
  return `${url.origin}/auth`
}

function getLogoutRedirectUri(request: Request) {
  const url = new URL(request.url)
  // FIXME: Remove this line once the following issue is fixed.
  // https://github.com/remix-run/remix/issues/1536
  if (process.env.ARC_SANDBOX) url.protocol = 'http'
  return `${url.origin}/logout`
}

const providerUrl = `https://cognito-idp.${
  COGNITO_USER_POOL_ID.split('_')[0]
}.amazonaws.com/${COGNITO_USER_POOL_ID}/`

function getClientId() {
  const client_id = process.env.OIDC_CLIENT_ID
  if (!client_id)
    throw new Error('environment variable OIDC_CLIENT_ID must be non-null')
  return client_id
}

const getOpenIDClient = memoizee(
  async function () {
    const issuer = await Issuer.discover(providerUrl)

    return new issuer.Client({
      client_id: getClientId(),
      client_secret: process.env.OIDC_CLIENT_SECRET,
      response_types: ['code'],
    })
  },
  { promise: true }
)

export async function login(request: Request) {
  const client = await getOpenIDClient()
  const nonce = generators.nonce()
  const state = generators.state()
  const code_verifier = generators.codeVerifier()
  const code_challenge = generators.codeChallenge(code_verifier)

  const authorizationUrl = client.authorizationUrl({
    scope: 'openid',
    nonce,
    state,
    code_challenge,
    code_challenge_method: 'S256',
    redirect_uri: getAuthRedirectUri(request),
  })

  const oidcSession = await oidcStorage.getSession()
  oidcSession.set('code_verifier', code_verifier)
  oidcSession.set('nonce', nonce)
  oidcSession.set('state', state)

  return redirect(authorizationUrl, {
    headers: {
      'Set-Cookie': await oidcStorage.commitSession(oidcSession),
    },
  })
}

export async function authorize(request: Request) {
  const client = await getOpenIDClient()
  const oidcSession = await oidcStorage.getSession(
    request.headers.get('Cookie')
  )
  const session = await storage.getSession()
  const url = new URL(request.url)
  const code_verifier = oidcSession.get('code_verifier')
  const nonce = oidcSession.get('nonce')
  const state = oidcSession.get('state')

  const params = client.callbackParams(url.search)
  const tokenSet = await client.callback(getAuthRedirectUri(request), params, {
    code_verifier,
    nonce,
    state,
  })
  const claims = tokenSet.claims()

  const groups = ((claims['cognito:groups'] ?? []) as string[]).filter(
    (group) => group.startsWith('gcn.gsfc.nasa.gov')
  )
  const subiss = new UnsecuredJWT({ sub: claims.sub, iss: claims.iss })
  session.set('subiss', subiss.encode())
  session.set('email', claims.email)
  session.set('groups', groups)

  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
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

  url.searchParams.set('client_id', getClientId())
  url.searchParams.set('logout_uri', getLogoutRedirectUri(request))

  return url.toString()
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  console.log(session.data)
  const red = redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
  console.log(red)
  return red
}
