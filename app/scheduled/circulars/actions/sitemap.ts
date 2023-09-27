/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { PutObjectCommand } from '@aws-sdk/client-s3'

import type { CircularAction } from '../actions'
import { Prefix as parentPrefix, putParams, s3 } from '../storage'
import { origin } from '~/lib/env.server'
import { maxEntriesPerSitemap, sitemap } from '~/lib/sitemap.server'
import type { Circular } from '~/routes/circulars/circulars.lib'

type SitemapContext = {
  items: Circular[]
  page: number
}

export const Prefix = `${parentPrefix}/sitemap`

async function flush(context: SitemapContext) {
  const Key = `${Prefix}/${context.page}.xml`
  const response = sitemap(
    context.items.map(({ circularId }) => `${origin}/circulars/${circularId}`)
  )
  const Body = await response.text()
  await s3.send(
    new PutObjectCommand({
      Body,
      Key,
      ContentType: response.headers.get('Content-Type')!,
      ...putParams,
    })
  )
  context.items.length = 0
  context.page += 1
}

export const sitemapAction: CircularAction<SitemapContext> = {
  initialize() {
    return { items: [], page: 0 }
  },
  async action(newItems, context) {
    do {
      const count = maxEntriesPerSitemap - context.items.length
      context.items.push(...newItems.slice(0, count))
      newItems.splice(0, count)
      if (context.items.length >= maxEntriesPerSitemap) await flush(context)
    } while (newItems.length)
  },
  async finalize(context) {
    if (context.items.length) await flush(context)
  },
}
