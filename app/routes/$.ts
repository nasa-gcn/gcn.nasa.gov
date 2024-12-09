import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'

import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Page Not Found',
  getSitemapEntries: () => null,
}

export const loader: LoaderFunction = function () {
  throw new Response(null, { status: 404 })
}

export const action: ActionFunction = function () {
  throw new Response(null, { status: 404 })
}

export default function () {}
