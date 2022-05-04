/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Link, NavLink } from '@remix-run/react'
import { useState } from 'react'
import {
  GovBanner,
  Header as USWDSHeader,
  NavMenuButton,
  PrimaryNav,
  Title,
  NavDropDownButton,
  Menu,
} from '@trussworks/react-uswds'
import TopBarProgress from 'react-topbar-progress-indicator'

TopBarProgress.config({
  barColors: {
    '0': '#e52207',
    '0.5': '#ffffff',
    '1.0': '#0050d8',
  },
})

export function Header({
  loading,
  pathname,
  email,
  logoutURL,
}: {
  loading: boolean
  pathname: string
  email?: string
  logoutURL?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false)
  const onClick = () => setExpanded((prvExpanded) => !prvExpanded)

  const pathMatches = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`)

  return (
    <>
      <a className="usa-skipnav" href="#main-content">
        Skip to main content
      </a>
      {loading && <TopBarProgress />}
      <GovBanner />
      <div className={`usa-overlay ${expanded ? 'is-visible' : ''}`}></div>
      <USWDSHeader basic className="usa-header usa-header--dark">
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <Link to="/">
                <img
                  id="site-logo"
                  src="/_static/img/logo.svg"
                  alt="NASA logo"
                />
                <span id="site-title">General Coordinates Network</span>
              </Link>
            </Title>
            <NavMenuButton onClick={onClick} label="Menu" />
          </div>
          <PrimaryNav
            mobileExpanded={expanded}
            items={[
              <NavLink className="usa-nav__link" to="/missions" key="/missions">
                Missions
              </NavLink>,
              <NavLink className="usa-nav__link" to="/notices" key="/notices">
                Notices
              </NavLink>,
              <NavLink
                className="usa-nav__link"
                to="/circulars"
                key="/circulars"
              >
                Circulars
              </NavLink>,
              <NavLink className="usa-nav__link" to="/docs" key="/docs">
                Documentation
              </NavLink>,
              email ? (
                <>
                  <NavDropDownButton
                    className={pathMatches('/user') ? 'active' : undefined}
                    type="button"
                    key="user"
                    label={email}
                    isOpen={userMenuIsOpen}
                    onToggle={() => setUserMenuIsOpen(!userMenuIsOpen)}
                    menuId="user"
                  />
                  <Menu
                    id="user"
                    isOpen={userMenuIsOpen}
                    items={[
                      <Link
                        key="/user/client_credentials"
                        to="/user/client_credentials"
                        onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                      >
                        Client Credentials
                      </Link>,
                      logoutURL && (
                        <a
                          key="logout"
                          href={logoutURL}
                          onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                        >
                          Sign Out
                        </a>
                      ),
                    ]}
                  />
                </>
              ) : (
                <a className="usa-nav__link" href="/login" key="/login">
                  Sign in / Sign up
                </a>
              ),
            ]}
            onToggleMobileNav={onClick}
          />
        </div>
      </USWDSHeader>
    </>
  )
}
