/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { CircularMetadata } from './circulars/circulars.lib'
import { search } from './circulars/circulars.server'
import { origin } from '~/lib/env.server'
import { xml } from '~/lib/sitemap.server'

function feedEntry({ circularId }: CircularMetadata) {
  return `<entry><link href="${origin}/circulars/${circularId}"></link></entry>`
}

export async function loader() {
  const { items } = await search({})
  return xml(
    `<feed xmlns="https://www.w3.org/2005/Atom">${items
      .map(feedEntry)
      .join('')}</feed>`,
    {
      headers: { 'Cache-Control': `public, max-age=${60 * 5}` },
    }
  )
}
