import type { ActionFunction, LoaderFunction } from '@remix-run/node'

import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Page Not Found',
  noIndex: true,
}

export const loader: LoaderFunction = function () {
  throw new Response(null, { status: 404 })
}

export const action: ActionFunction = function () {
  throw new Response(null, { status: 404 })
}

export default function () {}
