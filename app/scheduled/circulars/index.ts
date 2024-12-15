/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { forAllCirculars } from './actions'
import { sitemapAction } from './actions/sitemap'
import { statsAction } from './actions/stats'
import { jsonUploadAction, txtUploadAction } from './actions/tar'

export async function handler() {
  await forAllCirculars(
    jsonUploadAction,
    txtUploadAction,
    statsAction,
    sitemapAction
  )
}
