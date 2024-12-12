/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { feature } from '~/lib/env.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Circular Group',
}

export function loader() {
  if (!feature('SYNONYMS')) throw new Response(null, { status: 404 })
  return null
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <Outlet />
    </GridContainer>
  )
}
