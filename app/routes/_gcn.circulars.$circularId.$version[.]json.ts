/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { formatCircularJson } from './_gcn.circulars/circulars.lib'
import { get } from './_gcn.circulars/circulars.server'
import { feature, origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'

export async function loader({
  params: { circularId, version },
}: LoaderFunctionArgs) {
  invariant(circularId)
  if (!feature('CIRCULAR_VERSIONS') && version)
    throw new Response(null, { status: 404 })
  invariant(version)
  const result = await get(parseFloat(circularId), parseFloat(version))
  return new Response(formatCircularJson(result), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...getCanonicalUrlHeaders(new URL(`/circulars/${circularId}`, origin)),
    },
  })
}
