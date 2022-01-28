import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  //useLoaderData,
} from 'remix'

import { useState } from 'react'

import type { LoaderFunction, MetaFunction, NavLinkProps } from 'remix'

import {
  Address,
  //Button,
  GovBanner,
  GridContainer,
  Header,
  Footer,
  FooterNav,
  Logo,
  NavMenuButton,
  //NavDropDownButton,
  //MegaMenu,
  //Menu,
  //Search,
  //PrimaryNav,
  ExtendedNav,
  Title,
} from '@trussworks/react-uswds'

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
  //const data = useLoaderData()
  const [expanded, setExpanded] = useState(false)
  const onClick = (): void => setExpanded((prvExpanded) => !prvExpanded)
  /*
  const MissionsMegaMenu = [
    [
      <a href="#linkOne" key="fermi_mission">
        Fermi
      </a>,
      <a href="#linkTwo" key="swift_mission">
        Swift
      </a>,
      <a href="#linkOne" key="ipn_imission">
        IPN
      </a>,
      <a href="#linkTwo" key="konus_mission">
        KONUS
      </a>,
    ],
    [
      <a href="#linkOne" key="fermi_mission">
        INTEGRAL
      </a>,
      <a href="#linkTwo" key="swift_mission">
        AGILE
      </a>,
      <a href="#linkOne" key="ipn_imission">
        MAXI
      </a>,
      <a href="#linkTwo" key="konus_mission">
        MOA
      </a>,
    ],
    [
      <a href="#linkOne" key="snews_mission">
        SNEWS
      </a>,
      <a href="#linkTwo" key="sk_sn_mission">
        SK_SN
      </a>,
      <a href="#linkOne" key="calut_imission">
        CALUT
      </a>,
      <a href="#linkTwo" key="amon_mission">
        AMON
      </a>,
    ],
    [
      <a href="#linkOne" key="ligo-virgo_mission">
        LIGO/Virgo
      </a>,
      <a href="#linkTwo" key="counterpart_mission">
        Counterpart
      </a>,
      <a href="#linkOne" key="coincidence_mission">
        Coincidence
      </a>,
      <a href="#linkTwo" key="simbad-ned_mission">
        SIMBAD-NED
      </a>,
    ],
  ]

  const ArchivesMegaMenu = [
    [
      <a href="#linkOne" key="notices_archive">
        Notices Archives
      </a>,
      <a href="#linkTwo" key="circular_archive">
        Circular Archives
      </a>,
      <a href="#linkOne" key="gcn_pub_archive">
        GCN Publications
      </a>,
      <a href="#linkTwo" key="gcn_classic">
        GCN Classic
      </a>,
    ],
  ]

  const [isOpen, setIsOpen] = useState([false, false])
  
  const GCNMegaMenu = [
    <>
      <a href="/aboutgcn" key="/aboutgcn" className="usa-nav__link">
        <span>About</span>
      </a>
      ,
      <a href="/aboutgcn" key="/aboutgcn" className="usa-nav__link">
        <span>Missions</span>
      </a>
      ,
      <>
        <NavDropDownButton
          onToggle={(): void => {
            onToggle(0, setIsOpen)
          }}
          menuId="mission_dropdown"
          isOpen={isOpen[0]}
          label="Missions"
          isCurrent={false}
        />
        <Menu
          key="missionsmegamenu"
          items={MissionsMegaMenu}
          isOpen={isOpen[0]}
          id="missions_dropdown"
        />
      </>
      ,
      <a href="/docs" key="/docs" className="usa-nav__link">
        <span>Documentation</span>
      </a>
      ,
      <a href="/notices" key="/notices" className="usa-nav__link">
        <span>Notices</span>
      </a>
      ,
      <a href="/circulars" key="/circulars" className="usa-nav__link">
        <span>Circulars</span>
      </a>
      ,
      <>
        <NavDropDownButton
          onToggle={(): void => {
            onToggle(1, setIsOpen)
          }}
          menuId="archive_dropdown"
          isOpen={isOpen[1]}
          label="Archives"
        />
        <Menu
          key="archivesmegamenu"
          items={ArchivesMegaMenu}
          isOpen={isOpen[1]}
          id="archive_dropdown"
        />
      </>
      ,
    </>,
  ]
*/
  const sign_in_links = [
    <a href="/login" key="login">
      Log In
    </a>,
    <a href="/createaccount" key="create_account">
      Create Account
    </a>,
  ]

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
        <Header
          extended={true}
          className="usa-header usa-header--dark"
          basicWithMegaMenu={true}
        >
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
          <ExtendedNav
            primaryItems={[
              <PrimaryNavLink to="/aboutgcn" key="/aboutgcn">
                About
              </PrimaryNavLink>,
              <PrimaryNavLink to="/missions" key="/missions">
                Missions
              </PrimaryNavLink>,
              <PrimaryNavLink to="/docs" key="/docs">
                Documentation
              </PrimaryNavLink>,
              <PrimaryNavLink to="/notices" key="/notices">
                Notices
              </PrimaryNavLink>,
              <PrimaryNavLink to="/circulars" key="/circulars">
                Circulars
              </PrimaryNavLink>,
              <PrimaryNavLink to="/archives" key="/archives">
                Archives
              </PrimaryNavLink>,
            ]}
            secondaryItems={sign_in_links}
            mobileExpanded={expanded}
            onToggleMobileNav={onClick}
          ></ExtendedNav>
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
