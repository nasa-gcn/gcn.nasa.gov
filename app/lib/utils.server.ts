/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { stripHtml } from 'string-strip-html'

export function stripTags(text: string) {
  return stripHtml(text).result
}
