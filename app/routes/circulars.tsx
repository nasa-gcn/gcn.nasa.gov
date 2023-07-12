/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { GridContainer } from '@trussworks/react-uswds'
import { Outlet } from 'react-router'

import { put } from './circulars/circulars.server'
import { getFormDataString } from '~/lib/utils'

export const handle = {
  breadcrumb: 'Circulars',
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  return await put(subject, body, request)
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <Outlet />
    </GridContainer>
  )
}
