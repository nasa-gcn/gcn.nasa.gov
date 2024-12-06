/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getUser } from './_auth/user.server'
import { CircularEditForm } from './circulars.edit.$circularId/CircularEditForm'
import { formatAuthor } from './circulars/circulars.lib'
import {
  get,
  getChangeRequest,
  submitterGroup,
} from './circulars/circulars.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Correction',
  getSitemapEntries: () => null,
}

export async function loader({
  params: { circularId },
  request,
}: LoaderFunctionArgs) {
  if (!circularId) throw new Response(null, { status: 404 })

  const user = await getUser(request)
  if (!user?.groups.includes(submitterGroup))
    throw new Response(null, { status: 403 })
  let existingRequest
  try {
    existingRequest = await getChangeRequest(parseFloat(circularId), user.sub)
  } catch (err) {
    if (!(err instanceof Response && err.status === 404)) throw err
  }
  const circular = existingRequest ?? (await get(parseFloat(circularId)))
  const defaultDateTime = new Date(circular.createdOn ?? 0).toISOString()

  return {
    formattedContributor: user ? formatAuthor(user) : '',
    defaultBody: circular.body,
    defaultSubject: circular.subject,
    defaultFormat: circular.format,
    circularId: circular.circularId,
    defaultSubmitter: circular.submitter,
    defaultEventId: circular.eventId,
    defaultCreatedOnDateTime: defaultDateTime,
    searchString: '',
  }
}

export default function () {
  const data = useLoaderData<typeof loader>()
  return <CircularEditForm {...data} intent="correction" />
}
