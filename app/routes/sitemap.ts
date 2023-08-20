/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import max from 'lodash/max'
import invariant from 'tiny-invariant'

import { origin } from '~/lib/env.server'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'

/**
 * The maximum number of URLs in a sitemap.
 *
 * See https://www.sitemaps.org/protocol.html#index
 */
const Limit = 50_000

interface ItemKey {
  circularId: number
}
interface Item extends ItemKey {
  createdOn: number
}

export const handle = { getSitemapEntries: () => null }

/**
 * Create an XML response.
 *
 * Prepend the standard XML declaration to the content and set the MIME type in
 * the HTTP response headers.
 */
export function xml(content: string, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/xml; charset=utf-8')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${content}`, {
    ...init,
    headers,
  })
}

function sitemapEntry(url: string) {
  return `<url><loc>${url}</loc><priority>0.7</priority></url>`
}

/**
 * Create a site map.
 *
 * See https://www.sitemaps.org/protocol.html#index
 */
export function sitemap(urls: string[], init?: ResponseInit) {
  invariant(urls.length <= Limit)
  return xml(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
      .map(sitemapEntry)
      .join('')}</urlset>`,
    init
  )
}

type SitemapIndexProps = {
  url: string
  lastModified?: number
}

function sitemapIndexEntry({ url, lastModified }: SitemapIndexProps) {
  return `<sitemap><loc>${url}</loc>${
    lastModified === undefined
      ? ''
      : `<lastmod>${new Date(lastModified).toISOString()}</lastmod>`
  }</sitemap>`
}

/**
 * Create a site map index, a directory of individual site maps.
 *
 * A sitemap index allows you to have multiple sitemaps, in case your site has
 * more pages than the maximum number of URLs per sitemap.
 *
 * See https://www.sitemaps.org/protocol.html#index
 */
export function sitemapIndex(props: SitemapIndexProps[], init?: ResponseInit) {
  return xml(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${props
      .map(sitemapIndexEntry)
      .join('')}</sitemapindex>`,
    init
  )
}

/**
 * Get one page of GCN Circular IDs, suitable for creating a sitemap.
 */
export async function getCircularsPage(ExclusiveStartKey: ItemKey | undefined) {
  const db = await tables<{ circulars: Item }>()
  return await db.circulars.scan({
    ExclusiveStartKey,
    Limit,
    ProjectionExpression: 'circularId, createdOn',
  })
}

export async function loader() {
  // This is the URL of the main site map, which is automatically generated in
  // otherRootRoutes.ts.
  const props: SitemapIndexProps[] = [{ url: `${origin}/sitemap/main` }]

  // Determine pagination for Circulars and add a site map URL for each page.
  let ExclusiveStartKey: ItemKey | undefined
  do {
    const result = await getCircularsPage(ExclusiveStartKey)
    props.push({
      url: `${origin}/sitemap/circulars/${
        ExclusiveStartKey?.circularId ?? '-'
      }`,
      lastModified: max(result.Items.map(({ createdOn }) => createdOn)),
    })
    ExclusiveStartKey = result.LastEvaluatedKey as ItemKey | undefined
  } while (ExclusiveStartKey)

  return sitemapIndex(props, {
    headers: publicStaticShortTermCacheControlHeaders,
  })
}
