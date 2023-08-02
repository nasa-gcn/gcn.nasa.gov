/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { generators } from 'openid-client'

import { getOpenIDClient, oidcStorage, storage } from './_auth/auth.server'
import { parseTokenSet, updateSession } from './_auth/user.server'

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
