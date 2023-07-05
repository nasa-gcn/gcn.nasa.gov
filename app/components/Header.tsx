/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link, NavLink } from '@remix-run/react'
import {
  Menu,
  NavMenuButton,
  PrimaryNav,
  Title,
  Header as USWDSHeader,
} from '@trussworks/react-uswds'
import { useEffect, useState } from 'react'

import { useEmail } from '~/root'

import logo from '~/img/logo.svg'

/**
 * A variation on the NavDropDownButton component from @trussworks/react-uswds
 * that acts as a simple hyperlink if JavaScript is disabled or if the page
 * has not yet been hydrated.
 *
 * Adapted from https://github.com/trussworks/react-uswds/blob/main/src/components/header/NavDropDownButton/NavDropDownButton.tsx.
 */
function NavDropDownButton({
  label,
  menuId,
  isOpen,
  onToggle,
  isCurrent,
  className,
  ...props
}: {
  label: string
  menuId: string
  isOpen: boolean
  onToggle: () => void
  isCurrent?: boolean
} & Parameters<typeof NavLink>[0]) {
  return (
    <NavLink
      className={`usa-nav__link ${className}`}
      style={{ padding: 0 }}
      {...props}
    >
      <button
        type="button"
        className="usa-accordion__button"
        data-testid="navDropDownButton"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(e) => {
          onToggle()
          e.preventDefault()
        }}
      >
        <span>{label}</span>
      </button>
    </NavLink>
  )
}

export function Header() {
  const email = useEmail()
  const [expanded, setExpanded] = useState(false)
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false)
  const onClick = () => setExpanded((prvExpanded) => !prvExpanded)
  const [isDesktop, setIsDesktop] = useState<boolean>(false)
  const headerTheme = isDesktop ? 'usa-header--dark' : 'usa-header'

  useEffect(() => {
    const handleResize = () => {
      const isDesktopView = window.innerWidth >= 768
      setIsDesktop(isDesktopView)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <div className={`usa-overlay ${expanded ? 'is-visible' : ''}`}></div>
      <USWDSHeader basic className={`usa-header ${headerTheme}`}>
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <Link to="/">
                <img id="site-logo" src={logo} alt="NASA logo" />
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
                    to="/user"
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
                        Profile
                      </Link>,
                      <Link
                        key="endorsements"
                        to="/user/endorsements"
                        onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                      >
                        Peer Endorsements
                      </Link>,
                      <Link
                        key="credentials"
                        to="/user/credentials"
                        onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                      >
                        Client Credentials
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
