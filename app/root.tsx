import {
  Link,
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
} from 'remix'

import { ReactNode, useState } from 'react'

import type { LoaderFunction, MetaFunction } from 'remix'

import {
  FooterNav,
  GovBanner,
  Grid,
  GridContainer,
  Header,
  IconBugReport,
  IconComment,
  IconGithub,
  IconList,
  Identifier,
  IdentifierGov,
  IdentifierIdentity,
  IdentifierLink,
  IdentifierLinks,
  IdentifierLinkItem,
  IdentifierLogo,
  IdentifierLogos,
  IdentifierMasthead,
  NavMenuButton,
  PrimaryNav,
  Title,
  NavDropDownButton,
  Menu,
} from '@trussworks/react-uswds'

import { getLogoutURL, storage } from '~/lib/auth.server'

import highlightStyle from 'highlight.js/styles/github.css'
import logo from './img/logo.svg'

export const meta: MetaFunction = () => {
  return { title: 'GCN - General Coordinates Network' }
}

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: '/static/css/custom.css',
  },
  {
    rel: 'stylesheet',
    href: highlightStyle,
  },
  ...[16, 40, 57, 72, 114, 144, 192].map((size) => ({
    rel: 'icon',
    href: `/static/img/favicons/favicon-${size}.png`,
    sizes: `${size}x${size}`,
  })),
]

export const loader: LoaderFunction = async function ({ request }) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  if (session.get('subiss')) {
    return {
      email: session.get('email'),
      logoutURL: await getLogoutURL(request),
    }
  } else {
    return {}
  }
}

export function CatchBoundary() {
  const caught = useCatch()
  return (
    <Document>
      <h1>
        Error {caught.status}: {caught.statusText}
      </h1>
    </Document>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

function Document({ children }: { children: ReactNode }) {
  const location = useLocation()
  const data = useLoaderData()
  const [expanded, setExpanded] = useState(false)
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false)
  const onClick = (): void => setExpanded((prvExpanded) => !prvExpanded)

  const pathMatches = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)

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
                <NavLink
                  className="usa-nav__link"
                  to="/missions"
                  key="/missions"
                >
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
                data?.email ? (
                  <>
                    <NavDropDownButton
                      className={pathMatches('/user') ? 'active' : undefined}
                      type="button"
                      key="user"
                      label={data.email}
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
                        <a
                          key="logout"
                          href={data.logoutURL}
                          onClick={() => setUserMenuIsOpen(!userMenuIsOpen)}
                        >
                          Sign Out
                        </a>,
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
        </Header>
        <ScrollRestoration />
        <section className="usa-section">
          <GridContainer>{children}</GridContainer>
        </section>
        <Identifier>
          <div className="usa-footer__primary-section text-ink">
            <FooterNav
              size="medium"
              links={[
                <GridContainer>
                  <Grid row gap>
                    <Grid mobileLg={{ col: 6 }} desktop={{ col: 3 }}>
                      <div className="usa-media-block">
                        <div className="usa-media-block__img circle-6 bg-base-darkest display-flex flex-row flex-align-center flex-justify-center">
                          <a
                            className="usa-footer__primary-link"
                            href="/contact"
                            key="contacticon"
                          >
                            <IconComment size={4} color={'white'} />
                          </a>
                        </div>
                        <div className="usa-media-block_body">
                          Questions or Comments?
                          <a
                            className="usa-footer__primary-link"
                            href="/contact"
                            key="contact"
                            rel="external"
                          >
                            Contact GCN directly
                          </a>
                        </div>
                      </div>
                    </Grid>
                    <Grid mobileLg={{ col: 6 }} desktop={{ col: 3 }}>
                      <div className="usa-media-block">
                        <div className="usa-media-block__img circle-6 bg-base-darkest display-flex flex-row flex-align-center flex-justify-center">
                          <a
                            className="usa-footer__primary-link"
                            href="https://github.com/tachgsfc/www.gcn.gsfc.nasa.gov"
                            key="githubicon"
                          >
                            <IconGithub size={4} color={'white'} />
                          </a>
                        </div>
                        <div className="usa-media-block_body">
                          Running into an issue?
                          <a
                            className="usa-footer__primary-link"
                            href="https://github.com/tachgsfc/www.gcn.gsfc.nasa.gov"
                            key="github"
                            rel="external"
                          >
                            Reference the GCN Github.
                          </a>
                        </div>
                      </div>
                    </Grid>
                    <Grid mobileLg={{ col: 6 }} desktop={{ col: 3 }}>
                      <div className="usa-media-block">
                        <div className="usa-media-block__img circle-6 bg-base-darkest display-flex flex-row flex-align-center flex-justify-center">
                          <a
                            className="usa-footer__primary-link"
                            href="/bugreport"
                            key="bugreporticon"
                          >
                            <IconBugReport size={4} color={'white'} />
                          </a>
                        </div>
                        <div className="usa-media-block_body">
                          Observed something that seems broken or inaccurate?
                          <a
                            className="usa-footer__primary-link"
                            href="/bugreport"
                            key="bugreport"
                          >
                            Report a Bug.
                          </a>
                        </div>
                      </div>
                    </Grid>
                    <Grid mobileLg={{ col: 6 }} desktop={{ col: 3 }}>
                      <div className="usa-media-block">
                        <div className="usa-media-block__img circle-6 bg-base-darkest display-flex flex-row flex-align-center flex-justify-center">
                          <a
                            className="usa-footer__primary-link"
                            href="/docs/changes"
                            key="changelogicon"
                          >
                            <IconList size={4} color={'white'} />
                          </a>
                        </div>
                        <div className="usa-media-block_body">
                          Latest updates are recorded on the{' '}
                          <a
                            className="usa-footer__primary-link"
                            href="/docs/changes"
                            key="changelog"
                          >
                            Change Log.
                          </a>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </GridContainer>,
              ]}
            />
          </div>
          <IdentifierMasthead aria-label="Agency identifier">
            <IdentifierLogos>
              <IdentifierLogo href="https://www.nasa.gov">
                <img
                  src={logo}
                  className="usa-identifier__logo-img"
                  alt="NASA logo"
                />
              </IdentifierLogo>
            </IdentifierLogos>
            <IdentifierIdentity domain="www.gcn.gsfc.nasa.gov">
              A service of the{' '}
              <a
                rel="external"
                href="https://science.gsfc.nasa.gov/astrophysics/"
              >
                Astrophysics Science Division
              </a>{' '}
              at{' '}
              <a rel="external" href="https://www.nasa.gov/">
                NASA
              </a>{' '}
              <a rel="external" href="https://www.nasa.gov/goddard">
                Goddard Space Flight Center
              </a>
            </IdentifierIdentity>
          </IdentifierMasthead>
          <IdentifierLinks navProps={{ 'aria-label': 'Important links' }}>
            <IdentifierLinkItem>
              <IdentifierLink rel="external" href="https://www.nasa.gov/about">
                About NASA
              </IdentifierLink>
            </IdentifierLinkItem>
            <IdentifierLinkItem>
              <IdentifierLink rel="external" href="https://www.nasa.gov/FOIA">
                FOIA Requests
              </IdentifierLink>
            </IdentifierLinkItem>
            <IdentifierLinkItem>
              <IdentifierLink
                rel="external"
                href="https://www.nasa.gov/offices/odeo/no-fear-act"
              >
                No FEAR Act
              </IdentifierLink>
            </IdentifierLinkItem>
            <IdentifierLinkItem>
              <IdentifierLink rel="external" href="https://oig.nasa.gov/">
                Office of the Inspector General
              </IdentifierLink>
            </IdentifierLinkItem>
            <IdentifierLinkItem>
              <IdentifierLink
                rel="external"
                href="https://www.nasa.gov/about/highlights/HP_Privacy.html"
              >
                Privacy Policy
              </IdentifierLink>
            </IdentifierLinkItem>
          </IdentifierLinks>
          <IdentifierGov aria-label="U.S. government information and services">
            NASA&apos;s Goddard Space Flight Center, Public Inquiries, Mail Code
            130, Greenbelt, MD 20771 USA{' '}
            <a key="telephone" href="tel:1-301-286-2000">
              (301) 286-2000
            </a>
            <br />
            U.S. government information and services:{' '}
            <a rel="external" href="https://www.usa.gov">
              Visit USA.gov
            </a>
          </IdentifierGov>
        </Identifier>
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
