/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link, NavLink, Outlet, useOutletContext } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'
import { useState } from 'react'

import { SideNav, SideNavSub } from '~/components/SideNav'

export const handle = {
  breadcrumb: 'Documentation',
}

type ContextType = {
  showSideNav: boolean
  setShowSideNav: (val: boolean) => void
}

export function useSideNavContext() {
  return useOutletContext<ContextType>()
}

export default function () {
  const [showSideNav, setShowSideNav] = useState(true)

  return (
    <GridContainer className="usa-section">
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-3" hidden={!showSideNav}>
          <SideNav
            items={[
              <NavLink key="." to="." end>
                About GCN
              </NavLink>,
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
              <NavLink key="schema-browser" to="schema-browser">
                Schema-Browser
              </NavLink>,
              <NavLink key="history" to="history">
                History
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
              <NavLink key="producers" to="producers">
                New Notice Producers
              </NavLink>,
              <NavLink key="roadmap" to="roadmap">
                Road Map
              </NavLink>,
            ]}
          />
        </div>
        <div
          className={showSideNav ? 'desktop:grid-col-9' : 'desktop:grid-col-12'}
        >
          <Outlet context={{ showSideNav, setShowSideNav }} />
        </div>
      </div>
    </GridContainer>
  )
}
