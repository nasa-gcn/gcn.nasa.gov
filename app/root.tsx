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
  Address,
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

import { LoginButton } from './components/LoginButton'

import { storage } from '~/lib/auth.server'

import style from '~/css/custom.css'
import highlightStyle from 'highlight.js/styles/github.css'

export const meta: MetaFunction = () => {
  return { title: 'GCN - General Coordinates Network' }
}

export const links = () => [
  {
    rel: 'stylesheet',
    // FIXME: should get from bundle using webpack or postcss
    href: 'https://unpkg.com/nasawds@3.0.177/src/css/styles.css',
  },
  {
    rel: 'stylesheet',
    href: style,
  },
  {
    rel: 'stylesheet',
    href: highlightStyle,
  },
  {
    rel: 'shortcut icon',
    href: 'https://unpkg.com/nasawds@3.0.177/src/img/favicons/favicon.ico',
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
    <html lang="en">
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
                  <img
                    id="site-logo"
                    src="https://www1.grc.nasa.gov/wp-content/themes/nasapress/dist/images/logo-nasa.svg"
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
              {[
                data.email ? (
                  <Button
                    outline
                    className="text-white"
                    type="button"
                    key="account"
                  >
                    {data.email}
                  </Button>
                ) : (
                  <LoginButton key="login" />
                ),
              ]}
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
            <div className="usa-footer__primary-container grid-row">
              <div className="mobile-lg:grid-col-8">
                <FooterNav
                  size="slim"
                  links={Array(4).fill(
                    <a className="usa-footer__primary-link" href="#">
                      Primary Link
                    </a>
                  )}
                />
              </div>
              <div className="tablet:grid-col-4">
                <Address
                  size="slim"
                  items={[
                    <a key="telephone" href="tel:1-800-555-5555">
                      (800) CALL-GOVT
                    </a>,
                    <a key="email" href="mailto:info@agency.gov">
                      info@agency.gov
                    </a>,
                  ]}
                />
              </div>
            </div>
          }
          secondary={
            <Logo
              size="slim"
              image={
                <img
                  className="usa-footer__logo-img"
                  alt="NASA logo"
                  src="https://www1.grc.nasa.gov/wp-content/themes/nasapress/dist/images/logo-nasa.svg"
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
