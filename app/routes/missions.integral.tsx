/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { redirect } from '@remix-run/react'

export async function loader() {
  return redirect('../archive/integral', 301)
}
