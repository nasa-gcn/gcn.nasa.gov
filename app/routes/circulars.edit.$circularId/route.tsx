/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { getUser } from '../_auth/user.server'
import { formatAuthor } from '../circulars/circulars.lib'
import {
  get,
  getChangeRequest,
  moderatorGroup,
  submitterGroup,
} from '../circulars/circulars.server'
import { CircularEditForm } from './CircularEditForm'
import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: ({ params: { circularId } }) => `Edit - ${circularId}`,
  noIndex: true,
}

export async function loader({
  params: { circularId },
  request,
}: LoaderFunctionArgs) {
  if (!circularId) throw new Response(null, { status: 404 })

  const user = await getUser(request)
  if (
    !(
      user?.groups.includes(moderatorGroup) ||
      user?.groups.includes(submitterGroup)
    )
  )
    throw new Response(null, { status: 403 })

  let circular
  try {
    circular = await getChangeRequest(parseFloat(circularId), user.sub)
  } catch (err) {
    if (!(err instanceof Response && err.status === 404)) throw err
  }
  circular ??= await get(parseFloat(circularId))

  const formattedContributor = formatAuthor(user)

  return {
    formattedContributor,
    defaultBody: circular.body,
    defaultSubject: circular.subject,
    defaultFormat: circular.format,
    circularId: circular.circularId,
    defaultSubmitter: circular.submitter,
    defaultEventId: circular.eventId,
    searchString: '',
  }
}

export default function () {
  const data = useLoaderData<typeof loader>()
  return (
    <>
      <h1>Edit GCN Circular</h1>
      <p className="usa-paragraph">
        See{' '}
        <Link to="/docs/circulars/corrections">
          documentation on Circulars moderation
        </Link>{' '}
        for more information on corrections.
      </p>
      <CircularEditForm {...data} />
    </>
  )
}
