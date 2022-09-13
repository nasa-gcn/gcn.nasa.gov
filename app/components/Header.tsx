/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Link, NavLink, useLocation } from '@remix-run/react'
import { useState } from 'react'
import {
  Header as USWDSHeader,
  NavMenuButton,
  PrimaryNav,
  Title,
  NavDropDownButton,
  Menu,
} from '@trussworks/react-uswds'

export function Header({ email }: { email?: string }) {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState(false)
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false)
  const onClick = () => setExpanded((prvExpanded) => !prvExpanded)

  const pathMatches = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`)

  return (
    <>
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
              // <>
              //   <NavDropDownButton
              //     className={pathMatches('/circulars') ? 'active' : undefined}
              //     type="button"
              //     key="user"
              //     label="Circulars"
              //     isOpen={circularsMenuIsOpen}
              //     onToggle={() => setCircularsMenuIsOpen(!circularsMenuIsOpen)}
              //     menuId="user"
              //   />
              //   <Menu
              //     id="circ"
              //     isOpen={circularsMenuIsOpen}
              //     items={[
              //       <Link
              //         key="info"
              //         to="/circulars"
              //         onClick={() =>
              //           setCircularsMenuIsOpen(!circularsMenuIsOpen)
              //         }
              //       >
              //         Info
              //       </Link>,
              //       <Link
              //         key="search"
              //         to="/circulars/search"
              //         onClick={() =>
              //           setCircularsMenuIsOpen(!circularsMenuIsOpen)
              //         }
              //       >
              //         Search
              //       </Link>,
              //       email ? (
              //         <Link
              //           key="submit"
              //           to="/circulars/submit"
              //           onClick={() =>
              //             setCircularsMenuIsOpen(!circularsMenuIsOpen)
              //           }
              //         >
              //           Submit
              //         </Link>
              //       ) : null,
              //     ]}
              //   />
              // </>,
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
                        key="user"
                        to="/user"
                        onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                      >
                        Account
                      </Link>,
                      <Link
                        key="circulars"
                        to="/user/circulars"
                        onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                      >
                        GCN Circulars
                      </Link>,
                      <Link
                        key="credentials"
                        to="/user/credentials"
                        onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                      >
                        Credentials
                      </Link>,
                      <Link
                        key="email"
                        to="/user/email"
                        onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                      >
                        Email Notifications
                      </Link>,
                      <Link key="logout" to="/logout">
                        Sign Out
                      </Link>,
                    ]}
                  />
                </>
              ) : (
                <Link className="usa-nav__link" to="/login" key="/login">
                  Sign in / Sign up
                </Link>
              ),
            ]}
            onToggleMobileNav={onClick}
          />
        </div>
      </USWDSHeader>
    </>
  )
}
