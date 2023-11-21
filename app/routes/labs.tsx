/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Outlet } from '@remix-run/react'

import { feature } from '~/lib/env.server'
import { type BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'ACROSS',
}

export function loader() {
  if (feature('LABS')) return null
  else throw new Response(null, { status: 404 })
}

export default function () {
  return (
    <>
      <h1>ACROSS</h1>
      <main>
        <Outlet />
      </main>
    </>
  )
}
