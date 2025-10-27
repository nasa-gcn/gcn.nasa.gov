/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export type SEOHandle = {
  /**
   * If set to true, then exclude the route from the sitemap and add tell
   * robots not to index it.
   */
  noIndex?: boolean
}
