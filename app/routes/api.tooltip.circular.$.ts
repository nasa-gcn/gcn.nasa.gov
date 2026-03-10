/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { get } from './circulars/circulars.server'
import {
  notFoundIfBrowserRequest,
  publicStaticShortTermCacheControlHeaders,
} from '~/lib/headers.server'

export async function loader({
  request: { headers },
  params: { '*': value },
}: LoaderFunctionArgs) {
  notFoundIfBrowserRequest(headers)
  invariant(value)
  const { subject, submitter } = await get(parseFloat(value))
  return json(
    { subject, submitter },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}
