/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import { Outlet } from '@remix-run/react'

import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Moderation',
  getSitemapEntries: () => null,
}

export default function () {
  return (
    <>
      <h1>Circulars Moderation</h1>
      <Outlet />
    </>
  )
}
