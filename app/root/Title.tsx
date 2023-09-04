/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SerializeFrom } from '@remix-run/node'
import { useMatches } from '@remix-run/react'
import type { UIMatch as UIMatchRR } from 'react-router'

type UIMatch<D = unknown> = UIMatchRR<SerializeFrom<D>, BreadcrumbHandle<D>>

export type BreadcrumbHandle<D = unknown> = {
  breadcrumb?: string | ((match: UIMatch<D>) => string | undefined)
}

export function Title() {
  const title = (useMatches() as UIMatch[])
    .map((match) => {
      let breadcrumb = match.handle?.breadcrumb
      if (typeof breadcrumb === 'function') breadcrumb = breadcrumb(match)
      return breadcrumb
    })
    .filter(Boolean)
    .join(' - ')
  return <title>{title}</title>
}
