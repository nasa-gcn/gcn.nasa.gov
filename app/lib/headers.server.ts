/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * HTTP headers for static, long-lived data.
 */
export const publicStaticCacheControlHeaders = {
  'Cache-Control': 'public, max-age=315360000',
}

/**
 * HTTP headers for 1 day life.
 */
export const publicStaticShortTermCacheControlHeaders = {
  'Cache-Control': 'public, max-age=86400',
}

/**
 * Get HTTP headers for declaring the canonical URL to search engines.
 *
 * This adds HTTP headers that are equivalent to the HTML
 * <link rel="canonical"> tag.
 *
 * @see https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls#rel-canonical-header-method
 */
export function getCanonicalUrlHeaders(url: string | URL) {
  return {
    Link: `<${url}>; rel="canonical"`,
  }
}

/**
 * Get HTTP Basic auth request headers for a username and password.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7617
 */
export function getBasicAuthHeaders(username: string, password: string) {
  if (username.includes(':'))
    throw new Error('Usernames for basic auth must not contain colons')
  const userpass = Buffer.from(`${username}:${password}`).toString('base64')
  return { Authorization: `Basic ${userpass}` }
}

export function pickHeaders(headers: Headers, keys: string[]) {
  const result: [string, string][] = []
  for (const key of keys) {
    const value = headers.get(key)
    if (value) result.push([key, value])
  }
  return result
}
