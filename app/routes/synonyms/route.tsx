/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { getUser } from '../_auth/user.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  const isModerator = user?.groups.includes('gcn.nasa.gov/circular-moderator')

  if (!isModerator) {
    throw new Response(null, {
      status: 403,
    })
  }
  return null
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <Outlet />
    </GridContainer>
  )
}
