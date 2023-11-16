/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { Link, NavLink, useLoaderData } from '@remix-run/react'
import {
  Menu,
  NavMenuButton,
  PrimaryNav,
  Title,
  Header as USWDSHeader,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { Meatball } from '~/components/meatball/Meatball'
import { useEmail, useFeature, useUserIdp } from '~/root'
import { getUser } from '~/routes/_gcn._auth/user.server'

import styles from './header.module.css'

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  const isModerator =
    user?.groups.includes('gcn.nasa.gov/circular-moderator') || false
  return isModerator
}

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
  const featureSynonyms = useFeature('SYNONYM_GROUPING')

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

  const isModerator = useLoaderData<typeof loader>()

  return (
    <>
      {expanded && (
        <div className="usa-overlay is-visible" onClick={hideMobileNav} />
      )}
      <USWDSHeader
        basic
        className={`usa-header usa-header--dark ${styles.header}`}
      >
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
          <PrimaryNav
            mobileExpanded={expanded}
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
              featureSynonyms && isModerator && (
                <NavLink
                  className="usa-nav__link"
                  to="/synonyms"
                  key="/synonyms"
                  onClick={hideMobileNav}
                >
                  Synonyms
                </NavLink>
              ),
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
                    label={email}
                    isOpen={userMenuIsOpen}
                    onToggle={() => {
                      setUserMenuIsOpen(!userMenuIsOpen)
                    }}
                    menuId="user"
                  />
                  <Menu
                    id="user"
                    isOpen={userMenuIsOpen}
                    items={[
                      <Link key="user" to="/user" onClick={onClickUserMenuItem}>
                        Profile
                      </Link>,
                      <Link
                        key="endorsements"
                        to="/user/endorsements"
                        onClick={onClickUserMenuItem}
                      >
                        Peer Endorsements
                      </Link>,
                      !idp && (
                        <Link
                          key="password"
                          to="/user/password"
                          onClick={onClickUserMenuItem}
                        >
                          Reset Password
                        </Link>
                      ),
                      <Link
                        key="credentials"
                        to="/user/credentials"
                        onClick={onClickUserMenuItem}
                      >
                        Client Credentials
                      </Link>,
                      <Link
                        key="email"
                        to="/user/email"
                        onClick={onClickUserMenuItem}
                      >
                        Email Notifications
                      </Link>,
                      <Link
                        key="logout"
                        to="/logout"
                        onClick={onClickUserMenuItem}
                      >
                        Sign Out
                      </Link>,
                    ]}
                  />
                </>
              ) : (
                <Link
                  className="usa-nav__link"
                  to="/login"
                  key="/login"
                  onClick={hideMobileNav}
                >
                  Sign in / Sign up
                </Link>
              ),
            ]}
            onToggleMobileNav={toggleMobileNav}
          />
        </div>
      </USWDSHeader>
    </>
  )
}
