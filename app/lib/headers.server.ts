/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

export const publicStaticCacheControlHeaders = {
  'Cache-Control': 'public, max-age=315360000',
}

export function getCanonicalUrlHeaders(url: string | URL) {
  return {
    Link: `<${url}>; rel="canonical"`,
  }
}
