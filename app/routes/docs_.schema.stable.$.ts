import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { getLatestRelease } from '~/lib/schema-data.server'

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  return redirect(`/docs/schema/${await getLatestRelease()}/${path}`, {
    headers: publicStaticShortTermCacheControlHeaders,
  })
}
