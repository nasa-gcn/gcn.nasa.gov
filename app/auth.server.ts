// Authenticates using OpenID Connect,
// then extracts the subject claim and stashes it in the session.
// FIXME: Add PKCE for CSRF protection.

import {
  createCookieSessionStorage,
  redirect
} from 'remix';

import {
  generators,
  Issuer
} from 'openid-client'

const redirect_uri = `${process.env.URL_PREFIX}/auth`

export const storage = createCookieSessionStorage({
  cookie: {
    name: 'session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.SESSION_SECRET!],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,  // one month
    httpOnly: true
  }
})

export async function getOpenIDClient()
{
  if (!process.env.OIDC_PROVIDER_URL)
    throw Error('OIDC_PROVIDER_URL must be non-null')
  if (!process.env.OIDC_CLIENT_ID)
    throw Error('OIDC_CLIENT_ID must be non-null')

  const issuer = await Issuer.discover(process.env.OIDC_PROVIDER_URL)
  return new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID!,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    response_types: ['code'],
    redirect_uris: [redirect_uri]
  })
}

export async function login()
{
  const client = await getOpenIDClient()
  const state = generators.state()

  const authorizationUrl = client.authorizationUrl({
    scope: 'openid',
    state
  })

  const session = await storage.getSession()
  session.set('state', state)

  return redirect(authorizationUrl, {
    headers : {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}

export async function authorize(request: Request)
{
  const client = await getOpenIDClient()
  const session = await storage.getSession(request.headers.get('Cookie'))
  const url = new URL(request.url)
  const state = session.get('state')

  const params = client.callbackParams(url.search)
  const tokenSet = await client.callback(
    redirect_uri,
    params,
    { state }
  )
  const claims = tokenSet.claims()

  session.unset('state')
  session.set('sub', claims.sub)
  session.set('email', claims.email)

  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    }
  })
}
