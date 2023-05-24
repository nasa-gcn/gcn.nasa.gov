/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link, NavLink, Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { SideNav, SideNavSub } from '~/components/SideNav'

export const handle = {
  breadcrumb: 'Documentation',
}

export default function () {
  return (
    <GridContainer className="usa-section">
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-3">
          <SideNav
            items={[
              <NavLink key="." to="." end>
                About GCN
              </NavLink>,
              <>
                <NavLink key="client" to="client">
                  Kafka Client Setup
                </NavLink>
                <SideNavSub
                  base="client"
                  key="client-sub"
                  items={[
                    <Link key="python" to="client#python">
                      Python
                    </Link>,
                    <Link key="nodejs" to="client#nodejs">
                      Node.js
                    </Link>,
                    <Link key="c" to="client#c">
                      C
                    </Link>,
                    <Link key="c-1" to="client#c-1">
                      C#
                    </Link>,
                  ]}
                />
              </>,
              <>
                <NavLink key="circulars" to="circulars" end>
                  Circulars
                </NavLink>
                <SideNavSub
                  base="circulars"
                  items={[
                    <NavLink key="subscribing" to="circulars/subscribing">
                      Subscribing
                    </NavLink>,
                    <NavLink key="submitting" to="circulars/submitting">
                      Submitting
                    </NavLink>,
                    <NavLink key="styleguide" to="circulars/styleguide">
                      Style Guide
                    </NavLink>,
                    <NavLink key="archive" to="circulars/archive">
                      Archive
                    </NavLink>,
                  ]}
                />
              </>,
              <>
                <NavLink key="contributing" to="contributing">
                  Contributing
                </NavLink>
                <SideNavSub
                  base="contributing"
                  key="contributing-sub"
                  items={[
                    <NavLink key="index" to="contributing" end>
                      Getting Started
                    </NavLink>,
                    <NavLink
                      key="feature-flags"
                      to="contributing/feature-flags"
                    >
                      Feature Flags
                    </NavLink>,
                  ]}
                />
              </>,
              <NavLink key="producers" to="producers">
                New Notice Producers
              </NavLink>,
              <NavLink key="roadmap" to="roadmap">
                Road Map
              </NavLink>,
              <>
                <NavLink key="faq" to="faq">
                  Frequently Asked Questions
                </NavLink>
                <SideNavSub
                  base="faq"
                  key="faq-sub"
                  items={[
                    <Link key="kafka" to="faq#kafka">
                      Kafka
                    </Link>,
                    <Link key="circulars" to="faq#circulars">
                      Circulars
                    </Link>,
                    <Link key="accounts" to="faq#accounts">
                      Accounts
                    </Link>,
                  ]}
                />
              </>,
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
