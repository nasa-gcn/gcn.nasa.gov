import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { getLatestRelease } from '~/lib/schema-data'

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  return redirect(`/docs/schema/${await getLatestRelease()}/${path}`)
}
