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

export function loader({ request }: LoaderFunctionArgs) {
  return generateSitemap(request, routes, {
    siteUrl: origin,
    headers: {
      'Cache-Control': `public, max-age=${60 * 5}`,
    },
  })
}
