/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'

import { getRefreshToken, getUser } from './_auth/user.server'

export async function loader({
  request,
  params: { tokenId },
}: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !tokenId) throw new Response(null, { status: 403 })

  const { token, scope } = await getRefreshToken(user.sub, tokenId)
  return new Response(token, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${scope.replace('/', '_')}"`,
      'Content-Length': Buffer.byteLength(token).toString(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store',
      'Strict-Transport-Security':
        'max-age=63072000; includeSubDomains; preload',
    },
  })
}
