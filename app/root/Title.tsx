/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AppData, SerializeFrom } from '@remix-run/node'
import {
  type RouteMatch as RemixRouteMatch,
  useMatches,
} from '@remix-run/react'

// FIXME: https://github.com/remix-run/remix/pull/7333
type RouteMatch<T = AppData> = Omit<RemixRouteMatch, 'data'> & {
  data: SerializeFrom<T>
}

export type BreadcrumbHandle<T = AppData> = {
  breadcrumb?: string | ((match: RouteMatch<T>) => string | undefined)
}

export function Title() {
  const title = useMatches()
    .map((match) => {
      let breadcrumb = (match.handle as BreadcrumbHandle | undefined)
        ?.breadcrumb
      if (typeof breadcrumb === 'function') breadcrumb = breadcrumb(match)
      return breadcrumb
    })
    .filter(Boolean)
    .join(' - ')
  return <title>{title}</title>
}
