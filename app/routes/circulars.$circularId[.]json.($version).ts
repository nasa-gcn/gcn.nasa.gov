/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { formatCircularJson } from './circulars/circulars.lib'
import { get, getCircularHistory } from './circulars/circulars.server'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'

export async function loader({
  params: { circularId, version },
}: DataFunctionArgs) {
  invariant(circularId)

  const history = await getCircularHistory(parseFloat(circularId))
  // Probably a better way to do this. It works but could probably be cleaner
  const result =
    version && parseInt(version) <= history.length && parseInt(version) > 0
      ? history.sort((a, b) => (a.version ?? 1) - (b.version ?? 1))[
          parseInt(version) - 1
        ]
      : await get(parseFloat(circularId))
  return new Response(formatCircularJson(result), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...getCanonicalUrlHeaders(new URL(`/circulars/${circularId}`, origin)),
    },
  })
}
