/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { UnsecuredJWT } from 'jose'
import { generators } from 'openid-client'
import { getOpenIDClient, oidcStorage, storage } from './auth.server'

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

        const cookie = await oidcStorage.commitSession(oidcSession)

        return { cookie, nonce, state, code_challenge }
      })(),
    ])

    const authorizationUrl = client.authorizationUrl({
      scope: 'openid',
      code_challenge_method: 'S256',
      redirect_uri: url,
      ...props,
    })

    return redirect(authorizationUrl, { headers: { 'Set-Cookie': cookie } })
  } else {
    const sessionPromise = await storage.getSession()
    const [client, { oidcSessionDestroyPromise, ...checks }] =
      await Promise.all([
        getOpenIDClient(),
        (async () => {
          const cookie = headers.get('Cookie')
          const oidcSession = await oidcStorage.getSession(cookie)
          const code_verifier = oidcSession.get('code_verifier')
          const nonce = oidcSession.get('nonce')
          const state = oidcSession.get('state')
          if (!code_verifier || !nonce || !state)
            throw new Response(
              'Your session timed out. Please try logging in again.',
              { status: 400 }
            )
          const oidcSessionDestroyPromise =
            oidcStorage.destroySession(oidcSession)
          return { oidcSessionDestroyPromise, code_verifier, nonce, state }
        })(),
      ])

    const params = client.callbackParams(parsedUrl.search)
    parsedUrl.search = ''
    const tokenSet = await client.callback(parsedUrl.toString(), params, checks)
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
}
