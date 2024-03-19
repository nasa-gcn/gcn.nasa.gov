/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'

import type { BreadcrumbHandle } from '~/root/Title'

export { Outlet as default } from '@remix-run/react'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Email Notifications',
  getSitemapEntries: () => null,
}
