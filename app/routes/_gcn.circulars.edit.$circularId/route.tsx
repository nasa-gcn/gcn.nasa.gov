/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getUser } from '../_gcn._auth/user.server'
import { AstroDataContext } from '../_gcn.circulars.$circularId.($version)/AstroDataContext'
import { formatAuthor } from '../_gcn.circulars/circulars.lib'
import { get, moderatorGroup } from '../_gcn.circulars/circulars.server'
import { CircularEditForm } from './CircularEditForm'
import { feature, origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
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
  return json(
    { isAuthenticated, isAuthorized, formattedEditor, circular },
    { headers: getCanonicalUrlHeaders(new URL(`/circulars/edit`, origin)) }
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

export default function () {
  const { isAuthorized, formattedEditor, circular } =
    useLoaderData<typeof loader>()

  const formDefaults = {
    formattedContributor: formattedEditor,
    circular,
    defaultBody: circular?.body || '',
    defaultSubject: circular?.subject || '',
    searchString: '',
    isAuthorized,
  }

  return (
    <AstroDataContext.Provider value={{ rel: 'noopener', target: '_blank' }}>
      <CircularEditForm {...formDefaults} />
    </AstroDataContext.Provider>
  )
}
