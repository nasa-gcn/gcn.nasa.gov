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

import { getUser } from './_gcn._auth/user.server'
import { CircularEditForm } from './_gcn.circulars.edit.$circularId/CircularEditForm'
import { formatAuthor } from './_gcn.circulars/circulars.lib'
import { get } from './_gcn.circulars/circulars.server'
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
  if (!user) throw new Response(null, { status: 403 })
  const circular = await get(parseFloat(circularId))
  return {
    formattedContributor: user ? formatAuthor(user) : '',
    defaultBody: circular.body,
    defaultSubject: circular.subject,
    defaultFormat: circular.format,
    circularId: circular.circularId,
    submitter: circular.submitter,
    searchString: '',
  }
}

export default function () {
  const data = useLoaderData<typeof loader>()
  return <CircularEditForm {...data} intent="correction" />
}
