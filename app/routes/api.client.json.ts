/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { getPublicClientId } from '~/lib/cognito.server'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'

export async function loader() {
  const client_id = await getPublicClientId()
  return new Response(JSON.stringify({ client_id }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...getCanonicalUrlHeaders(new URL('/api/client/json', origin)),
    },
  })
}
