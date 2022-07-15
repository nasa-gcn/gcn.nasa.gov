/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { MetaFunction } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { NavStepIndicator } from '~/components/NavStepIndicator'

export const meta: MetaFunction = () => ({
  title: 'GCN - Start Streaming GCN Notices',
})

export default function Streaming() {
  return (
    <>
      <h1>Start Streaming GCN Notices</h1>
      <NavStepIndicator
        counters="small"
        headingLevel="h4"
        steps={[
          { to: '.', label: 'Account Info' },
          { to: 'credentials', label: 'Select Credentials' },
          { to: 'alerts', label: 'Customize Alerts' },
          { to: 'code', label: 'Code Sample' },
        ]}
      />
      <Outlet />
    </>
  )
}
