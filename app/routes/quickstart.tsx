/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { NavStepIndicator } from '~/components/NavStepIndicator'
import { useFeature } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Start Streaming GCN Notices',
}

export default function () {
  const tokenAuth = useFeature('TOKEN_AUTH')
  return (
    <GridContainer className="usa-section">
      <h1>Start Streaming GCN Notices</h1>
      <NavStepIndicator
        counters="small"
        headingLevel="h4"
        steps={[
          { to: '.', label: 'Sign in / Sign up' },
          {
            to: 'credentials',
            label: tokenAuth ? 'Select Token' : 'Select Credentials',
          },
          { to: 'alerts', label: 'Customize Alerts' },
          { to: 'code', label: 'Get Sample Code' },
        ]}
      />
      <Outlet />
    </GridContainer>
  )
}
