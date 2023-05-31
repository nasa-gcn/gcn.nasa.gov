import type { LoaderFunction } from '@remix-run/node'

export const handle = {
  breadcrumb: 'Page Not Found',
  getSitemapEntries: () => null,
}

export const loader: LoaderFunction = function () {
  throw new Response(null, { status: 404 })
}

export default function () {}
