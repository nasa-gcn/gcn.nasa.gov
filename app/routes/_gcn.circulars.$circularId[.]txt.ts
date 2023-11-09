/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { formatCircularText } from './_gcn.circulars/circulars.lib'
import { get } from './_gcn.circulars/circulars.server'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'

export async function loader({ params: { circularId } }: DataFunctionArgs) {
  invariant(circularId)
  const result = await get(parseFloat(circularId))
  return new Response(formatCircularText(result), {
    headers: getCanonicalUrlHeaders(
      new URL(`/circulars/${circularId}`, origin)
    ),
  })
}
