import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'

import { useState } from 'react'

import type { LoaderFunction, MetaFunction, NavLinkProps } from 'remix'

import {
  Button,
  GovBanner,
  GridContainer,
  Header,
  Footer,
  FooterNav,
  Logo,
  NavMenuButton,
  PrimaryNav,
  Title,
} from '@trussworks/react-uswds'

import { storage } from '~/lib/auth.server'

import highlightStyle from 'highlight.js/styles/github.css'
import logo from './img/logo.svg'
import favicon from '../node_modules/nasawds/src/img/favicons/favicon.png'

export const meta: MetaFunction = () => {
  return { title: 'GCN - General Coordinates Network' }
}

export const links = () => [
  {
    rel: 'stylesheet',
    href: '/static/css/custom.css',
  },
  {
    rel: 'stylesheet',
    href: highlightStyle,
  },
  {
    rel: 'shortcut icon',
    href: favicon,
  },
]

export const loader: LoaderFunction = async function ({ request }) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return {
    email: session.get('email'),
  }
}

function PrimaryNavLink(props: NavLinkProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        `usa-nav__link ${isActive ? 'usa-current' : ''}`
      }
      {...props}
    >
      {props.children}
    </NavLink>
  )
}

export default function App() {
  const data = useLoaderData()
  const [expanded, setExpanded] = useState(false)
  const onClick = (): void => setExpanded((prvExpanded) => !prvExpanded)

  return (
    <html lang="en-US">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <GovBanner />
        <div className={`usa-overlay ${expanded ? 'is-visible' : ''}`}></div>
        <Header basic className="usa-header usa-header--dark">
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
                <PrimaryNavLink to="/missions" key="/missions">
                  Missions
                </PrimaryNavLink>,
                <PrimaryNavLink to="/notices" key="/notices">
                  Notices
                </PrimaryNavLink>,
                <PrimaryNavLink to="/circulars" key="/circulars">
                  Circulars
                </PrimaryNavLink>,
                <PrimaryNavLink to="/docs" key="/docs">
                  Documentation
                </PrimaryNavLink>,
              ]}
              onToggleMobileNav={onClick}
            >
              {data.email ? (
                <Button outline className="text-white" type="button">
                  {data.email}
                </Button>
              ) : (
                <Link to="/login">
                  <Button type="button" outline className="text-white">
                    Sign in / Sign up
                  </Button>
                </Link>
              )}
            </PrimaryNav>
          </div>
        </Header>
        <ScrollRestoration />
        <section className="usa-section">
          <GridContainer>
            <Outlet />
          </GridContainer>
        </section>
        <Footer
          size="slim"
          primary={
            <FooterNav
              size="medium"
              links={[
                <a
                  className="usa-footer__primary-link"
                  href="/contact"
                  key="contact"
                >
                  Contact
                </a>,
                <a
                  className="usa-footer__primary-link"
                  href="/linkspage"
                  key="linkspage"
                >
                  Contributors
                </a>,
                <a
                  className="usa-footer__primary-link"
                  href="/docs/changes"
                  key="changelog"
                >
                  Change Log
                </a>,
              ]}
            />
          }
          secondary={
            <Logo
              size="slim"
              image={
                <img
                  className="usa-footer__logo-img"
                  alt="NASA logo"
                  src={logo}
                />
              }
              heading={
                <p className="usa-footer__logo-heading">
                  National Aeronautics and Space Administration
                </p>
              }
            />
          }
        />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
