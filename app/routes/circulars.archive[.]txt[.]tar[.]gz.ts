/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { redirect } from '@remix-run/node'

import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { getArchiveURL } from '~/scheduled/circulars/actions/tar'

export function loader() {
  return redirect(getArchiveURL('txt'), {
    headers: publicStaticShortTermCacheControlHeaders,
  })
}
