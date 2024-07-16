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

import { getUser } from '../_auth/user.server'
import { formatAuthor } from '../circulars/circulars.lib'
import { get, moderatorGroup } from '../circulars/circulars.server'
import { CircularEditForm } from './CircularEditForm'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Edit',
  getSitemapEntries: () => null,
}

export async function loader({
  params: { circularId },
  request,
}: LoaderFunctionArgs) {
  if (!circularId) throw new Response(null, { status: 404 })
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const formattedContributor = formatAuthor(user)
  const circular = await get(parseFloat(circularId))
  const defaultDateTime = new Date(circular.createdOn ?? 0).toISOString()

  return {
    formattedContributor,
    defaultBody: circular.body,
    defaultSubject: circular.subject,
    defaultFormat: circular.format,
    circularId: circular.circularId,
    defaultSubmitter: circular.submitter,
    defaultCreatedOnDateTime: defaultDateTime,
    searchString: '',
  }
}

export default function () {
  const data = useLoaderData<typeof loader>()
  return <CircularEditForm {...data} intent="edit" />
}
