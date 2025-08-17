/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'

import { getAllSynonymMembers } from './synonyms/synonyms.server'

export async function loader({
  request: { headers, url },
}: LoaderFunctionArgs) {
  // This route exists only to fetch data. If the route is accessed via
  // the browser, throw a 404.
  const acceptHeader = headers.get('accept') || ''
  const isHtmlRequest = acceptHeader.includes('text/html')

  if (isHtmlRequest) {
    throw new Response('Not Found', { status: 404 })
  }

  const parsedUrl = new URL(url)
  const eventIds = parsedUrl.searchParams.getAll('eventIds')

  return eventIds?.length
    ? (await getAllSynonymMembers(eventIds)).reverse()
    : []
}
