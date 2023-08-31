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

import { put, putChangeRequest, putDeprecatedVersion } from './circulars.server'
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

  const circularId = getFormDataString(data, 'circularId')
  if (circularId) {
    const parsedId = parseFloat(circularId)
    const intent = getFormDataString(data, 'intent')

    if (intent == 'requested-edit') {
      await putChangeRequest(parsedId, body, subject, request)
      console.log('Success')
    } else {
      await putDeprecatedVersion(
        {
          circularId: parsedId,
          body,
          subject,
        },
        request
      )
    }

    return null
  }
  return await put({ subject, body, submittedHow: 'web' }, request)
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <Outlet />
    </GridContainer>
  )
}
