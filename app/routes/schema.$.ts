/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type DataFunctionArgs, redirect } from '@remix-run/node'

/* Make all JSON files at https://github.com/nasa-gcn/gcn-schema available from
 * https://gcn.nasa.gov/schema */
export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  return redirect(
    `https://raw.githubusercontent.com/nasa-gcn/gcn-schema/${path ?? ''}`
  )
}
