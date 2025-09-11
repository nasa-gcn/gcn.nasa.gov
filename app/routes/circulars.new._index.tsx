/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, useSearchParams } from '@remix-run/react'

import { getUser } from './_auth/user.server'
import { CircularEditForm } from './circulars.new.$circularId/CircularEditForm'
import { formatAuthor } from './circulars/circulars.lib'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'New',
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  let formattedAuthor
  if (user) {
    formattedAuthor = formatAuthor(user)
  }
  return json(
    { formattedAuthor },
    { headers: getCanonicalUrlHeaders(new URL(`/circulars/new`, origin)) }
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

export default function () {
  const { formattedAuthor } = useLoaderData<typeof loader>()

  // Get default subject from search params, then strip out
  let [searchParams] = useSearchParams()
  const defaultBody = searchParams.get('body') || ''
  const defaultSubject = searchParams.get('subject') || ''
  const defaultFormat =
    searchParams.get('format') === 'text/markdown'
      ? ('text/markdown' as const)
      : undefined

  searchParams = new URLSearchParams(searchParams)
  searchParams.delete('subject')
  searchParams.delete('body')
  searchParams.delete('format')
  const searchString = searchParams.toString()
  const formDefaults = {
    formattedContributor: formattedAuthor ?? '',
    defaultBody,
    defaultSubject,
    defaultFormat,
    searchString,
  }

  return (
    <>
      <h1>New GCN Circular</h1>
      <CircularEditForm {...formDefaults} />
    </>
  )
}
