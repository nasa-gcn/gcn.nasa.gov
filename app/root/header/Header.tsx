/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, NavLink } from '@remix-run/react'
import {
  Menu,
  NavMenuButton,
  PrimaryNav,
  Title,
  Header as USWDSHeader,
} from '@trussworks/react-uswds'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import { Meatball } from '~/components/meatball/Meatball'
import { useEmail, useUserIdp } from '~/root'

import styles from './header.module.css'

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
  const idp = useUserIdp()
  const [expanded, setExpanded] = useState(false)
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1025 : false
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateMobile = () => {
        setMobile(window.innerWidth < 1025)
      }
      window.addEventListener('resize', updateMobile)
      return () => window.removeEventListener('resize', updateMobile)
    }
  }, [])

  useOnClickOutside(menuRef, () => {
    if (expanded) setExpanded(false)
  })

  useOnClickOutside(userMenuRef, (event) => {
    if (
      !document
        .querySelector('#userMenuDropdown')
        ?.contains(event.target as Node) &&
      userMenuIsOpen
    )
      setUserMenuIsOpen(false)
  })

  function toggleMobileNav() {
    setExpanded((expanded) => !expanded)
  }

  function hideMobileNav() {
    setExpanded(false)
  }

  function onClickUserMenuItem() {
    if (userMenuIsOpen && !expanded) setUserMenuIsOpen(false)
    hideMobileNav()
  }

  return (
    <>
      <div
        className={classNames('usa-overlay', {
          'is-visible': expanded && mobile,
        })}
      />
      <USWDSHeader basic className={`usa-header--dark ${styles.header}`}>
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <Link to="/">
                <Meatball className="width-auto" />
                <span>General Coordinates Network</span>
              </Link>
            </Title>
            <NavMenuButton onClick={toggleMobileNav} label="Menu" />
          </div>
          <div ref={menuRef}>
            <PrimaryNav
              mobileExpanded={expanded}
              onToggleMobileNav={toggleMobileNav}
              items={[
                <NavLink
                  className="usa-nav__link"
                  to="/missions"
                  key="/missions"
                  onClick={hideMobileNav}
                >
                  Missions
                </NavLink>,
                <NavLink
                  className="usa-nav__link"
                  to="/notices"
                  key="/notices"
                  onClick={hideMobileNav}
                >
                  Notices
                </NavLink>,
                <NavLink
                  className="usa-nav__link"
                  to="/circulars"
                  key="/circulars"
                  onClick={hideMobileNav}
                >
                  Circulars
                </NavLink>,
                <NavLink
                  className="usa-nav__link"
                  to="/docs"
                  key="/docs"
                  onClick={hideMobileNav}
                >
                  Documentation
                </NavLink>,
                email ? (
                  <>
                    <NavDropDownButton
                      to="/user"
                      type="button"
                      key="user"
                      id="userMenuDropdown"
                      label={email}
                      isOpen={userMenuIsOpen}
                      onToggle={() => {
                        setUserMenuIsOpen(!userMenuIsOpen)
                      }}
                      menuId="user"
                    />
                    <div ref={userMenuRef}>
                      <Menu
                        id="user"
                        isOpen={userMenuIsOpen}
                        items={[
                          <NavLink
                            end
                            key="user"
                            to="/user"
                            onClick={onClickUserMenuItem}
                          >
                            Profile
                          </NavLink>,
                          <NavLink
                            key="endorsements"
                            to="/user/endorsements"
                            onClick={onClickUserMenuItem}
                          >
                            Peer Endorsements
                          </NavLink>,
                          !idp && (
                            <NavLink
                              key="password"
                              to="/user/password"
                              onClick={onClickUserMenuItem}
                            >
                              Reset Password
                            </NavLink>
                          ),
                          <NavLink
                            key="credentials"
                            to="/user/credentials"
                            onClick={onClickUserMenuItem}
                          >
                            Client Credentials
                          </NavLink>,
                          <NavLink
                            key="email"
                            to="/user/email"
                            onClick={onClickUserMenuItem}
                          >
                            Email Notifications
                          </NavLink>,
                          <Link
                            key="logout"
                            to="/logout"
                            onClick={onClickUserMenuItem}
                          >
                            Sign Out
                          </Link>,
                        ]}
                      />
                    </div>
                  </>
                ) : (
                  <Link
                    className="usa-nav__link text-no-wrap"
                    to="/login"
                    key="/login"
                    onClick={hideMobileNav}
                  >
                    Sign in / Sign up
                  </Link>
                ),
              ]}
            />
          </div>
        </div>
      </USWDSHeader>
    </>
  )
}
