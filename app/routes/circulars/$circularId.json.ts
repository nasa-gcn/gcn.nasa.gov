/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import { get } from './circulars.server'
import { getOrigin } from '~/lib/env.server'
import { getCanonicalUrlHeaders } from '~/lib/headers.server'

export async function loader({ params: { circularId } }: DataFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  const result = await get(parseFloat(circularId))
  delete result.sub
  return json(result, {
    headers: getCanonicalUrlHeaders(
      new URL(`/circulars/${circularId}`, getOrigin())
    ),
  })
}
