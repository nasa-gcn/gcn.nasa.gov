/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { NavLink, Outlet } from '@remix-run/react'
import { SideNav } from '@trussworks/react-uswds'

import { SideNavSub } from '~/components/SideNavSub'

export const handle = {
  breadcrumb: 'Documentation',
}

export default function () {
  return (
    <div className="grid-row grid-gap">
      <div className="desktop:grid-col-3">
        <SideNav
          items={[
            <NavLink key="." to="." end>
              About GCN
            </NavLink>,
            <NavLink key="client" to="client">
              Kafka Client Configuration
            </NavLink>,
            <>
              <NavLink key="circulars" to="circulars" end>
                Circulars
              </NavLink>
              <SideNav
                isSubnav={true}
                items={[
                  <NavLink key="subscribing" to="subscribing">
                    Subscribing
                  </NavLink>,
                  <NavLink key="submitting" to="submitting">
                    Submitting
                  </NavLink>,
                  <NavLink key="styleguide" to="styleguide">
                    Style Guide
                  </NavLink>,
                  <NavLink key="archive" to="archive">
                    Archive
                  </NavLink>,
                ]}
              />
            </>,
            <NavLink key="contribute" to="contribute">
              Contributing
            </NavLink>,
            <SideNavSub
              base="contributing"
              key="contributing-sub"
              isSubnav
              items={[
                <NavLink key="index" to="contributing" end>
                  Getting Started
                </NavLink>,
                <NavLink key="feature-flags" to="contributing/feature-flags">
                  Feature Flags
                </NavLink>,
              ]}
            />,
            <NavLink key="producers" to="producers">
              New Notice Producers
            </NavLink>,
            <NavLink key="roadmap" to="roadmap">
              Road Map
            </NavLink>,
            <NavLink key="faq" to="faq">
              Frequently Asked Questions
            </NavLink>,
          ]}
        />
      </div>
      <div className="desktop:grid-col-9">
        <Outlet />
      </div>
    </div>
  )
}
