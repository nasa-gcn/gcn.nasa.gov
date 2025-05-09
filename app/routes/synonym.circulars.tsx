import type { LoaderFunctionArgs } from '@remix-run/node'

import { getAllSynonymMembers } from './synonyms/synonyms.server'

export async function loader({
  request: { headers, url },
}: LoaderFunctionArgs) {
  const isBrowserNavigation = headers.get('Sec-Fetch-Mode') !== 'cors'

  if (isBrowserNavigation) {
    throw new Response(null, { status: 404 })
  }

  const parsedUrl = new URL(url)
  const eventIds = parsedUrl.searchParams.getAll('eventIds')

  return eventIds?.length ? await getAllSynonymMembers(eventIds) : []
}
