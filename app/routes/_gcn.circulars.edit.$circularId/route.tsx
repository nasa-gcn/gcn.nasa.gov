/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getUser } from '../_gcn._auth/user.server'
import { formatAuthor } from '../_gcn.circulars/circulars.lib'
import { get, moderatorGroup } from '../_gcn.circulars/circulars.server'
import { CircularEditForm } from './CircularEditForm'
import { feature } from '~/lib/env.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Edit',
}

export async function loader({
  params: { circularId },
  request,
}: LoaderFunctionArgs) {
  if (!feature('CIRCULAR_VERSIONS')) throw new Response(null, { status: 404 })
  if (!circularId) throw new Response(null, { status: 404 })
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const isAuthenticated = true
  const isAuthorized = user.groups.includes(moderatorGroup)
  const formattedEditor = formatAuthor(user)

  const circular = await get(parseFloat(circularId))
  return { isAuthenticated, isAuthorized, formattedEditor, circular }
}

export default function () {
  const { formattedEditor, circular } = useLoaderData<typeof loader>()

  const formDefaults = {
    formattedContributor: formattedEditor,
    circular,
    defaultBody: circular?.body || '',
    defaultSubject: circular?.subject || '',
    searchString: '',
  }

  return <CircularEditForm {...formDefaults} />
}
