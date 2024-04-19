/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import { Link, Outlet } from '@remix-run/react'

import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Moderation',
  getSitemapEntries: () => null,
}

export default function () {
  return (
    <>
      <h1>Circulars Moderation</h1>
      <p className="usa-paragraph">
        See{' '}
        <Link to="/docs/circulars/corrections">
          documentation on Circulars moderation
        </Link>
        .
      </p>
      <Outlet />
    </>
  )
}
