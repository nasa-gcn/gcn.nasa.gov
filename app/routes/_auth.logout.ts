/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { getOpenIDClient } from './_auth/auth.server'

export const loader: LoaderFunction = async ({ request: { url } }) => {
  const client = await getOpenIDClient()

  const post_logout_redirect_uri = `${new URL(url).origin}/post_logout`

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

  return redirect(logoutUrl)
}
