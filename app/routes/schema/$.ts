/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { type DataFunctionArgs, redirect } from '@remix-run/node'

/* Make all JSON files at https://github.com/nasa-gcn/gcn-schema available from
 * https://gcn.nasa.gov/schema */
export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  return redirect(
    `https://raw.githubusercontent.com/nasa-gcn/gcn-schema/main/${path ?? ''}`
  )
}
