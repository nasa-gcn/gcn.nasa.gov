/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type HeadersFunction, type LoaderFunctionArgs } from '@remix-run/node'

import { getUser } from '../_auth/user.server'
import { getVersions, moderatorGroup } from '../circulars/circulars.server'
import { pickHeaders } from '~/lib/headers.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle<typeof loader> = {
  breadcrumb({ data }) {
    if (data) {
      const { circularId } = data
      return `${circularId}`
    }
  },
}

export async function loader({
  params: { circularId },
  request,
}: LoaderFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })

  const history = await getVersions(parseFloat(circularId))
  history.reverse() // Sort by descending version

  const user = await getUser(request)
  const userIsModerator = user?.groups.includes(moderatorGroup)
  return { circularId, history, userIsModerator }
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])
