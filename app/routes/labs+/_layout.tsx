/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Outlet } from '@remix-run/react'

import { feature } from '~/lib/env.server'

export function loader() {
  return feature('LAB') || new Response(null, { status: 404 })
}

export default function () {
  return (
    <>
      <h1>ACROSS</h1>
      <Outlet />
    </>
  )
}
