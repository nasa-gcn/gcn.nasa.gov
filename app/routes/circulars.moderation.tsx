/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, Outlet } from '@remix-run/react'

import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Moderation',
  noIndex: true,
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
