/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { generators } from 'openid-client'
import invariant from 'tiny-invariant'

import {
  getOpenIDClient,
  getScopedOpenIDClient,
  oidcStorage,
  storage,
} from './_auth/auth.server'
import { parseTokenSet, updateSession } from './_auth/user.server'
import { origin } from '~/lib/env.server'

function ensureSameOrigin(url: string) {
  invariant(new URL(url).origin === origin)
}

export const loader: LoaderFunction = async ({ request: { headers, url } }) => {
  const parsedUrl = new URL(url)
  if (!parsedUrl.searchParams.get('code')) {
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

        const localRedirect = parsedUrl.searchParams.get('redirect')
        if (localRedirect) {
          ensureSameOrigin(localRedirect)
          oidcSession.set('redirect', localRedirect)
          parsedUrl.searchParams.delete('redirect')
        }

        const cookie = await oidcStorage.commitSession(oidcSession)

        return { cookie, nonce, state, code_challenge }
      })(),
    ])

    const identity_provider = parsedUrl.searchParams.get('identity_provider')
    parsedUrl.searchParams.delete('identity_provider')

    const authorizationUrl = client.authorizationUrl({
      scope: 'openid profile aws.cognito.signin.user.admin',
      code_challenge_method: 'S256',
      redirect_uri: parsedUrl.toString(),
      identity_provider,
      ...props,
    })

    return redirect(authorizationUrl, { headers: { 'Set-Cookie': cookie } })
  } else {
    const [client, { localRedirect, oidcSessionDestroyPromise, ...checks }] =
      await Promise.all([
        getOpenIDClient(),
        (async () => {
          const cookie = headers.get('Cookie')
          const oidcSession = await oidcStorage.getSession(cookie)
          const code_verifier = oidcSession.get('code_verifier')
          const nonce = oidcSession.get('nonce')
          const state = oidcSession.get('state')
          const localRedirect = oidcSession.get('redirect')
          if (localRedirect) ensureSameOrigin(localRedirect)
          if (!code_verifier || !nonce || !state)
            throw new Response(
              'Your session timed out. Please try logging in again.',
              { status: 400 }
            )
          const oidcSessionDestroyPromise =
            oidcStorage.destroySession(oidcSession)
          return {
            localRedirect,
            oidcSessionDestroyPromise,
            code_verifier,
            nonce,
            state,
          }
        })(),
      ])

    const params = client.callbackParams(parsedUrl.search)
    parsedUrl.search = ''
    const tokenSet = await client.callback(parsedUrl.toString(), params, checks)
    const parsedTokenSet = parseTokenSet(tokenSet)

    const { existingIdp } = parsedTokenSet
    if (existingIdp) {
      const [cookie] = await Promise.all([
        (async () => {
          const session = await oidcStorage.getSession()
          session.set('existingIdp', existingIdp)
          return await oidcStorage.commitSession(session)
        })(),
        oidcSessionDestroyPromise,
      ])
      return redirect('/logout', { headers: { 'Set-Cookie': cookie } })
    }

    const [cookie] = await Promise.all([
      (async () => {
        return await updateSession(parsedTokenSet, await storage.getSession())
      })(),
      oidcSessionDestroyPromise,
    ])

    return redirect(localRedirect ?? '/', {
      headers: { 'Set-Cookie': cookie },
    })
  }
}

export async function scopedLogin(
  request: Request,
  scope: string,
  name: string
) {
  const client = await getScopedOpenIDClient()

  const oidcSessionPromise = storage.getSession(request.headers.get('Cookie'))
  const redirect_uri = `${origin}${new URL(request.url).pathname.replace('/edit', '')}`
  const nonce = generators.nonce()
  const state = generators.state()
  const code_verifier = generators.codeVerifier()
  const code_challenge = generators.codeChallenge(code_verifier)
  const oidcSession = await oidcSessionPromise

  const current = oidcSession.get('tokenSets') || {}
  oidcSession.set('tokenSets', {
    ...current,
    [name]: { code_verifier, nonce, state, scope },
  })
  oidcSession.set('tokenName', name)
  const cookie = await storage.commitSession(oidcSession)
  const authUrl = client.authorizationUrl({
    redirect_uri,
    scope: `${scope}`,
    response_type: 'code',
    code_challenge_method: 'S256',
    nonce,
    state,
    code_challenge,
  })

  return { authUrl, cookie }
}
