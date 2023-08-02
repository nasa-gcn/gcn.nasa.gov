/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'

import { makeTarFile } from './circulars.server'

export async function loader({ request }: DataFunctionArgs) {
  const url = new URL(request.url)
  const fileType = url.searchParams.get('type')

  if (!fileType) return null
  const tarFile = await makeTarFile(fileType)

  return new Response(tarFile, {
    headers: {
      'Content-Type': 'application/tar',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
