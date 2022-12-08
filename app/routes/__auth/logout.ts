/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { getOpenIDClient, storage } from './auth.server'

export const loader: LoaderFunction = async ({ request: { headers, url } }) => {
  const [client, cookie] = await Promise.all([
    getOpenIDClient(),
    (async () => {
      const session = await storage.getSession(headers.get('Cookie'))
      return await storage.destroySession(session)
    })(),
  ])

  const post_logout_redirect_uri = new URL(url).origin

  let logoutUrl
  if (!process.env.COGNITO_USER_POOL_ID) {
    logoutUrl = client.endSessionUrl({ post_logout_redirect_uri })
    if (!logoutUrl) {
      throw new Error('Cannot discover end session url')
    }
  } else {
    // FIXME: Cognito does not advertise a discoverable end session endpoint.
    // Worse, its /logout URI endpoint does not behave exactly like the
    // standard OpenID Connect end session endpoint; it accepts a query string
    // parameter called "logout_uri" instead of "post_logout_redirect_uri"
    const auth_endpoint = client.issuer.metadata.authorization_endpoint
    if (!auth_endpoint)
      throw new Error(
        'client.issuer.metadata.authorization_endpoint must be present'
      )
    const newUrl = new URL(auth_endpoint)
    newUrl.pathname = '/logout'
    newUrl.searchParams.set('client_id', client.metadata.client_id)
    newUrl.searchParams.set('logout_uri', post_logout_redirect_uri)
    logoutUrl = newUrl.toString()
  }

  return redirect(logoutUrl, {
    headers: {
      'Set-Cookie': cookie,
    },
  })
}
