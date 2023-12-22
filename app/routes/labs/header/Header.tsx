/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, NavLink } from '@remix-run/react'
import {
  NavMenuButton,
  PrimaryNav,
  Title,
  Header as USWDSHeader,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { Meatball } from '~/components/meatball/Meatball'

import styles from './header.module.css'

export function Header() {
  const [expanded, setExpanded] = useState(false)

  function toggleMobileNav() {
    setExpanded((expanded) => !expanded)
  }

  function hideMobileNav() {
    setExpanded(false)
  }

  return (
    <>
      {expanded && (
        <div className="usa-overlay is-visible" onClick={hideMobileNav} />
      )}
      <USWDSHeader basic className={`usa-header--dark ${styles.header}`}>
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <Link to="/">
                <Meatball className="width-auto" />
                <span>Multimessenger Astrophysics</span>
              </Link>
            </Title>
            <NavMenuButton onClick={toggleMobileNav} label="Menu" />
          </div>
          <PrimaryNav
            mobileExpanded={expanded}
            items={[
              <NavLink
                className="usa-nav__link"
                to="/labs/missions"
                key="/labs/missions"
                onClick={hideMobileNav}
              >
                Missions
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/"
                key="/"
                onClick={hideMobileNav}
              >
                GCN
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/labs/tools"
                key="/labs/tools"
                onClick={hideMobileNav}
              >
                Tools
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/labs/proposals"
                key="/labs/proposals"
                onClick={hideMobileNav}
              >
                Proposals
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/labs/conferences"
                key="/labs/conferences"
                onClick={hideMobileNav}
              >
                Conferences
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/labs/about"
                key="/labs/about"
                onClick={hideMobileNav}
              >
                About
              </NavLink>,
            ]}
            onToggleMobileNav={toggleMobileNav}
          />
        </div>
      </USWDSHeader>
    </>
  )
}
