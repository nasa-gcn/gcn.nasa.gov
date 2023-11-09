/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { getUser } from '../_gcn._auth/user.server'
import { put } from './circulars.server'
import { getFormDataString } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Circulars',
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  return await put(
    { subject, body, submittedHow: 'web' },
    await getUser(request)
  )
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <Outlet />
    </GridContainer>
  )
}
