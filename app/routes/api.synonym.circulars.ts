/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'

import { getAllSynonymMembers } from './synonyms/synonyms.server'
import { notFoundIfBrowserRequest } from '~/lib/headers.server'

export async function loader({
  request: { headers, url },
}: LoaderFunctionArgs) {
  notFoundIfBrowserRequest(headers)
  const parsedUrl = new URL(url)
  const eventIds = parsedUrl.searchParams.getAll('eventIds')

  return eventIds?.length ? await getAllSynonymMembers(eventIds) : []
}
