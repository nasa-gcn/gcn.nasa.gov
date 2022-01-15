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
// 3. Save the "subiss" key in the session. Also save the user's email address
//    in the session, because we show the user's email in the nav bar to show
//    that they are logged in.

import { createCookieSessionStorage, redirect } from 'remix'
import memoizee from 'memoizee'
import { UnsecuredJWT } from 'jose'
import { generators, Issuer } from 'openid-client'

if (!process.env.SESSION_SECRET)
  throw new Error('environment variable SESSION_SECRET must be defined')

// Short-lived session for storing the OIDC state and PKCE code verifier
const oidcStorage = createCookieSessionStorage({
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
})

// Long-lived user session. The cookie name is the same as the oidcStorage
// session, so the cookie replaces it (with a longer expiration time).
export const storage = createCookieSessionStorage({
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
})

function getRedirectUri(request: Request) {
  const url = new URL(request.url)
  return `${url.origin}/auth`
}

const issuerDiscover = memoizee(
  async () => {
    if (!process.env.OIDC_PROVIDER_URL)
      throw new Error('environment variable OIDC_PROVIDER_URL must be defined')
    return await Issuer.discover(process.env.OIDC_PROVIDER_URL)
  },
  { promise: true }
)

async function getOpenIDClient(request: Request) {
  if (!process.env.OIDC_CLIENT_ID)
    throw new Error('environment variable OIDC_CLIENT_ID must be non-null')

  const issuer = await issuerDiscover()
  return new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    response_types: ['code'],
    redirect_uris: [getRedirectUri(request)],
  })
}

export async function login(request: Request) {
  const client = await getOpenIDClient(request)
  const state = generators.state()
  const code_verifier = generators.codeVerifier()
  const code_challenge = generators.codeChallenge(code_verifier)

  const authorizationUrl = client.authorizationUrl({
    scope: 'openid',
    state,
    code_challenge,
    code_challenge_method: 'S256',
  })

  const oidcSession = await oidcStorage.getSession()
  // FIXME: Does the code_verifier need to be encrypted, or is just signed OK?
  // See https://github.com/panva/node-openid-client/discussions/455
  oidcSession.set('code_verifier', code_verifier)
  oidcSession.set('state', state)

  return redirect(authorizationUrl, {
    headers: {
      'Set-Cookie': await oidcStorage.commitSession(oidcSession),
    },
  })
}

export async function authorize(request: Request) {
  const client = await getOpenIDClient(request)
  const oidcSession = await oidcStorage.getSession(
    request.headers.get('Cookie')
  )
  const session = await storage.getSession()
  const url = new URL(request.url)
  const code_verifier = oidcSession.get('code_verifier')
  const state = oidcSession.get('state')

  const params = client.callbackParams(url.search)
  const tokenSet = await client.callback(getRedirectUri(request), params, {
    code_verifier,
    state,
    // @ts-expect-error: Set this to null to disable nonce check.
    //
    // When Cognito is federating a social IdP, it adds a nonce to the callback
    // request, which causes validation to fail, because we did not provide a
    // nonce.
    //
    // Setting nonce to null disables the nonce check entirely, but it angers
    // TypeScript because the nonce property is typed as string | undefined.
    nonce: null,
  })
  const claims = tokenSet.claims()

  const subiss = new UnsecuredJWT({ sub: claims.sub, iss: claims.iss })
  session.set('subiss', subiss.encode())
  session.set('email', claims.email)

  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}
