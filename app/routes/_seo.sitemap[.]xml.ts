/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { generateSitemap } from '@nasa-gcn/remix-seo'
import { routes } from '@remix-run/dev/server-build'
import type { LoaderFunctionArgs } from '@remix-run/node'

import { origin } from '~/lib/env.server'
import type { SEOHandle } from '~/root/seo'

export function loader({ request }: LoaderFunctionArgs) {
  const routesToIndex = Object.fromEntries(
    Object.entries(routes).filter(
      ([
        ,
        {
          module: { handle },
        },
      ]) => !(handle as SEOHandle | undefined)?.noIndex
    )
  )

  return generateSitemap(request, routesToIndex, {
    siteUrl: origin,
    headers: {
      'Cache-Control': `public, max-age=${60 * 5}`,
    },
  })
}
