/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { json } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { getVersionRefs } from '~/lib/schema-data.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Documentation - Schema Browser',
}

export async function loader() {
  return json(await getVersionRefs(), {
    headers: publicStaticShortTermCacheControlHeaders,
  })
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <Outlet />
    </GridContainer>
  )
}
