/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import invariant from 'tiny-invariant'

/**
 * The maximum number of URLs in a sitemap.
 *
 * See https://www.sitemaps.org/protocol.html#index
 */
export const maxEntriesPerSitemap = 50_000

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
  invariant(urls.length <= maxEntriesPerSitemap)
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
