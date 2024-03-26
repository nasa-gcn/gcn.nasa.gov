/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { getUser } from '../_gcn._auth/user.server'
import { feature } from '~/lib/env.server'

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  const featureSynonyms = feature('SYNONYMS')
  const isModerator =
    user?.groups.includes('gcn.nasa.gov/circular-moderator') || false
  if (!isModerator || !featureSynonyms) return redirect('/')
  return null
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <Outlet />
    </GridContainer>
  )
}
