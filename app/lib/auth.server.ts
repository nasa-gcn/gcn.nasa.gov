// Authenticates using OpenID Connect,
// then extracts the subject claim and stashes it in the session.
// FIXME: Add PKCE for CSRF protection.

import { createCookieSessionStorage, redirect } from 'remix'
import memoizee from 'memoizee'
import { generators, Issuer } from 'openid-client'

if (!process.env.SESSION_SECRET)
  throw new Error('environment variable SESSION_SECRET must be defined')

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
    maxAge: 60 * 60 * 24 * 30, // one month
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

  const session = await storage.getSession()
  // FIXME: Does the code_verifier need to be encrypted, or is just signed OK?
  // See https://github.com/panva/node-openid-client/discussions/455
  session.set('code_verifier', code_verifier)
  session.set('state', state)

  return redirect(authorizationUrl, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function authorize(request: Request) {
  const client = await getOpenIDClient(request)
  const session = await storage.getSession(request.headers.get('Cookie'))
  const url = new URL(request.url)
  const code_verifier = session.get('code_verifier')
  const state = session.get('state')

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
    // Setting nocne to null disables the nonce check entirely, but it angers
    // TypeScript because the nonce property is typed as string | undefined.
    nonce: null,
  })
  const claims = tokenSet.claims()

  session.unset('code_verifier')
  session.unset('state')
  session.set('sub', claims.sub)
  session.set('email', claims.email)

  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}
