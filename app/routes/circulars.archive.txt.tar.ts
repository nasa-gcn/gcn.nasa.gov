/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'

import { makeTarFile } from './circulars/circulars.server'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'

export async function loader({ request }: DataFunctionArgs) {
  const tarFile = await makeTarFile('txt')

  return new Response(tarFile, {
    headers: publicStaticShortTermCacheControlHeaders,
  })
}
