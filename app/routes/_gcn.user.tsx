/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import { NavLink, Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { SideNav } from '~/components/SideNav'
import { useUserIdp } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'User',
  getSitemapEntries: () => null,
}

export default function () {
  const idp = useUserIdp()

  return (
    <GridContainer className="usa-section">
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-3">
          <SideNav
            items={[
              <NavLink key="." to="." end>
                Profile
              </NavLink>,
              <NavLink key="endorsements" to="endorsements">
                Peer Endorsements
              </NavLink>,
              ...(!idp
                ? [
                    <NavLink key="password" to="password">
                      Reset Password
                    </NavLink>,
                  ]
                : []),
              <NavLink key="circulars" to="circulars">
                Circulars
              </NavLink>,
              <NavLink key="credentials" to="credentials">
                Client Credentials
              </NavLink>,
              <NavLink key="email" to="email">
                Email Notifications
              </NavLink>,
              <NavLink key="logout" to="/logout">
                Sign Out
              </NavLink>,
            ]}
          />
        </div>
        <div className="desktop:grid-col-9">
          <Outlet />
        </div>
      </div>
    </GridContainer>
  )
}
