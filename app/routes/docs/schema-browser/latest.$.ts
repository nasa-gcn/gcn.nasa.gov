import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { getLatestRelease } from '~/lib/schema-data'

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  const latestRelease = await getLatestRelease()
  return redirect(`/docs/schema-browser/${latestRelease.tag_name}/${path}`)
}
