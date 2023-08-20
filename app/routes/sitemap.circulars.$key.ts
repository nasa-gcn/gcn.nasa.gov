/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { getCircularsPage, sitemap } from './sitemap'
import { origin } from '~/lib/env.server'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'

export const handle = { getSitemapEntries: () => null }

export async function loader({ params }: DataFunctionArgs) {
  const circularIdString = params.key
  invariant(circularIdString)

  let key
  if (circularIdString === '-') {
    key = undefined
  } else {
    const circularId = parseFloat(circularIdString)
    if (isNaN(circularId)) throw new Response(null, { status: 404 })
    key = { circularId }
  }

  const { Items } = await getCircularsPage(key)
  return sitemap(
    Items.map(({ circularId }) => `${origin}/circulars/${circularId}`),
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}
