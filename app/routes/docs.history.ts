/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { redirect } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async () => {
  return redirect('/docs/about')
}
