/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export { Outlet as default } from '@remix-run/react'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Email Notifications',
  noIndex: true,
}
