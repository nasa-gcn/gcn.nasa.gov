/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, NavLink, Outlet } from '@remix-run/react'
import { GridContainer } from '@trussworks/react-uswds'

import { SideNav, SideNavSub } from '~/components/SideNav'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
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
                <NavLink key="circulars" to="circulars">
                  Circulars
                </NavLink>
                <SideNavSub
                  base="circulars"
                  items={[
                    <NavLink key="subscribing" to="circulars" end>
                      About
                    </NavLink>,
                    <NavLink key="archive" to="circulars/archive">
                      Archive
                    </NavLink>,
                    <NavLink key="corrections" to="circulars/corrections">
                      Corrections
                    </NavLink>,
                    <NavLink key="subscribing" to="circulars/subscribing">
                      Subscribing
                    </NavLink>,
                    <NavLink key="submitting" to="circulars/submitting">
                      Submitting
                    </NavLink>,
                    <NavLink key="styleguide" to="circulars/styleguide">
                      Style Guide
                    </NavLink>,
                    <NavLink key="markdown" to="circulars/markdown">
                      Markdown
                    </NavLink>,
                  ]}
                />
              </>,
              <NavLink key="code-of-conduct" to="code-of-conduct">
                Code of Conduct
              </NavLink>,
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
                    <NavLink key="github" to="contributing/github">
                      GitHub
                    </NavLink>,
                    <NavLink
                      key="configuration"
                      to="contributing/configuration"
                    >
                      Configuration
                    </NavLink>,
                    <NavLink
                      key="feature-flags"
                      to="contributing/feature-flags"
                    >
                      Feature Flags
                    </NavLink>,
                    <NavLink key="deployment" to="contributing/deployment">
                      Deployment
                    </NavLink>,
                    <NavLink key="email" to="contributing/email">
                      Email Data Flow
                    </NavLink>,
                    <NavLink key="project" to="contributing/project">
                      GitHub Project Board
                    </NavLink>,
                    <NavLink key="npr7150" to="contributing/npr7150">
                      NPR 7150
                    </NavLink>,
                    <NavLink key="testing" to="contributing/testing">
                      Testing
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
                    <Link key="accounts" to="faq#operations">
                      Operations
                    </Link>,
                  ]}
                />
              </>,
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
                    <Link key="java" to="client#java">
                      Java
                    </Link>,
                    <NavLink key="code-samples" to="client/samples">
                      Sample Code
                    </NavLink>,
                  ]}
                />
              </>,
              <>
                <NavLink key="notices" to="notices">
                  Notices
                </NavLink>
                <SideNavSub
                  base="notices"
                  items={[
                    <NavLink key="about" to="notices" end>
                      About
                    </NavLink>,
                    <NavLink key="consuming" to="notices/consuming">
                      Consuming
                    </NavLink>,
                    <NavLink key="producing" to="notices/producers">
                      Producing
                    </NavLink>,
                    <NavLink key="schema" to="notices/schema">
                      Unified Schema
                    </NavLink>,
                    <NavLink key="archive" to="notices/archive">
                      Archive
                    </NavLink>,
                  ]}
                />
              </>,
              <NavLink key="roadmap" to="roadmap">
                Road Map
              </NavLink>,
              <NavLink key="schema" to="schema">
                Schema Browser
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
