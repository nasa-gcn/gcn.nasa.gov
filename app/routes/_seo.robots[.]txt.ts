/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { generateRobotsTxt } from '@nasa-gcn/remix-seo'

import { origin } from '~/lib/env.server'

export function loader() {
  return generateRobotsTxt([
    { type: 'sitemap', value: `${origin}/sitemap.xml` },
    { type: 'disallow', value: '/user' },
  ])
}
