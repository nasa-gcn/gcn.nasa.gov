/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { getLatestRelease } from '~/lib/schema-data.server'

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  return redirect(`/docs/schema/${await getLatestRelease()}/${path}`)
}
