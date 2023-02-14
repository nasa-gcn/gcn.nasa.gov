/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Outlet } from '@remix-run/react'
import { NavStepIndicator } from '~/components/NavStepIndicator'

export const handle = {
  breadcrumb: 'Start Streaming GCN Notices',
}

export default function () {
  return (
    <>
      <h1>Start Streaming GCN Notices</h1>
      <NavStepIndicator
        counters="small"
        headingLevel="h4"
        steps={[
          { to: '.', label: 'Sign in / Sign up' },
          { to: 'credentials', label: 'Select Credentials' },
          { to: 'alerts', label: 'Customize Alerts' },
          { to: 'code', label: 'Get Sample Code' },
        ]}
      />
      <Outlet />
    </>
  )
}
