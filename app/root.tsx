/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 *
 *
 *                                +-------------+
 *                                | TACH! TACH! |
 *                                +-------------+
 *                         \\    /
 *                 \\      (o>  /
 *                 (o>     //\
 *             ____(()_____V_/_____
 *                 ||      ||
 *                         ||
 *
 *
 */
import type {
  DataFunctionArgs,
  ErrorBoundaryComponent,
  LinksFunction,
  MetaFunction,
} from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
  useMatches,
  useNavigation,
} from '@remix-run/react'
import { ButtonGroup, GovBanner, GridContainer } from '@trussworks/react-uswds'
import TopBarProgress from 'react-topbar-progress-indicator'
import { useSpinDelay } from 'spin-delay'

import AnnounceBanner, { AnnouncementEvent } from './components/AnnounceBanner'
import { DevBanner } from './components/DevBanner'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Highlight } from './components/Highlight'
import { getFeatures, getOrigin } from './lib/env.server'
import { useRouteLoaderData } from './lib/remix'
import { getUser } from './routes/__auth/user.server'

import themeStyle from './theme/css/custom.css'
import highlightStyle from 'highlight.js/styles/github.css'
// FIXME: no top-level await, no import function
// const favicons = Object.fromEntries(
//   await Promise.all(
//     [16, 40, 57, 72, 114, 144, 192].map(async (size) => [
//       size,
//       await import(`~/theme/img/favicons/favicon-${size}.png`),
//     ])
//   )
// )
import favicon_16 from '~/theme/img/favicons/favicon-16.png'
import favicon_40 from '~/theme/img/favicons/favicon-40.png'
import favicon_57 from '~/theme/img/favicons/favicon-57.png'
import favicon_72 from '~/theme/img/favicons/favicon-72.png'
import favicon_114 from '~/theme/img/favicons/favicon-114.png'
import favicon_144 from '~/theme/img/favicons/favicon-144.png'
import favicon_192 from '~/theme/img/favicons/favicon-192.png'

const favicons = {
  16: favicon_16,
  40: favicon_40,
  57: favicon_57,
  72: favicon_72,
  114: favicon_114,
  144: favicon_144,
  192: favicon_192,
}

TopBarProgress.config({
  barColors: {
    '0': '#e52207',
    '0.5': '#ffffff',
    '1.0': '#0050d8',
  },
})

export const handle = {
  breadcrumb: 'GCN',
}

export const meta: MetaFunction = () => {
  return {
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1',
  }
}

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: themeStyle,
  },
  {
    rel: 'stylesheet',
    href: highlightStyle,
  },
  ...Object.entries(favicons).map(([size, href]) => ({
    rel: 'icon',
    href: href,
    sizes: `${size}x${size}`,
  })),
]

export async function loader({ request }: DataFunctionArgs) {
  const origin = getOrigin()

  const user = await getUser(request)
  const email = user?.email
  const features = getFeatures()

  return { origin, email, features }
}

/** Don't reevaluate this route's loader due to client-side navigations. */
export function shouldRevalidate() {
  return false
}

function useLoaderDataRoot() {
  return useRouteLoaderData<typeof loader>('root')
}

/**
 * Return true if the given feature flag is enabled.
 *
 * This is a React hook version of {@link feature}.
 *
 * Feature flags are configured by the environment variable GCN_FEATURES, which
 * is a comma-separated list of enabled features.
 */
export function useFeature(feature: string) {
  return useLoaderDataRoot().features.includes(feature)
}

export function useUrl() {
  const { origin } = useLoaderDataRoot()
  const { pathname, search, hash } = useLocation()
  const url = new URL(origin)
  url.pathname = pathname
  url.search = search
  url.hash = hash
  return url.toString()
}

export function useHostname() {
  return new URL(useLoaderDataRoot().origin).hostname
}

function Title() {
  const title = useMatches()
    .map(({ handle }) => handle?.breadcrumb)
    .filter(Boolean)
    .join(' - ')
  return <title>{title}</title>
}

function Progress() {
  const { state } = useNavigation()
  const showProgress = useSpinDelay(state !== 'idle')
  return <>{showProgress && <TopBarProgress />}</>
}

function Document({ children }: { children?: React.ReactNode }) {
  const { email } = useLoaderDataRoot()

  return (
    <html lang="en-US">
      <head>
        <Meta />
        <Links />
        <Title />
      </head>
      <body>
        <a className="usa-skipnav" href="#main-content">
          Skip to main content
        </a>
        <Progress />
        <AnnounceBanner message={New GCN Circulars service starts April 17, 2023. Learn more at one of these introductory webinars. Read more in our <Link to="/news">news</Link>.}>
          <AnnouncementEvent
            time="April 18, 2023 12:00-13:00 UTC"
            link="https://nasa-gov.zoomgov.com/webinar/register/WN_lHhwaELgQIympcfQaSOkbg"
            linkstring="Register"
            region="Atlantic"
          />
          <AnnouncementEvent
            time="April 18, 2023 20:00-21:00 UTC"
            link="https://nasa-gov.zoomgov.com/webinar/register/WN_BiIbwg65Qv2HvhkUSfrmwA"
            linkstring="Register"
            region="Asia and Oceania"
          />
          <AnnouncementEvent
            time="April 19, 2023 04:00-05:00 UTC"
            link="https://nasa-gov.zoomgov.com/webinar/register/WN_KcSEaCU1QFqiaoVcgFQvVA"
            linkstring="Register"
            region="Pacific"
          />
        </AnnounceBanner>
        <GovBanner />
        <DevBanner />
        <Header email={email} />
        <section className="usa-section main-content">
          <GridContainer>{children}</GridContainer>
        </section>
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const { status } = useCatch()
  const url = useUrl()
  if (status == 403) {
    return (
      <Document>
        <h1>Unauthorized</h1>
        <p className="usa-intro">
          We're sorry, you must log in to access the page you're looking for.
        </p>
        <p className="usa-paragraph">Log in to access that page, or go home.</p>
        <ButtonGroup>
          <Link
            to={`/login?redirect=${encodeURIComponent(url)}`}
            className="usa-button"
          >
            Log in and take me there
          </Link>
          <Link to="/" className="usa-button usa-button--outline">
            Go home
          </Link>
        </ButtonGroup>
      </Document>
    )
  } else {
    return (
      <Document>
        <h1>Unexpected error (HTTP {status})</h1>
        <p className="usa-intro">An unexpected error occurred.</p>
        <ButtonGroup>
          <Link to="/" className="usa-button">
            Go home
          </Link>
        </ButtonGroup>
      </Document>
    )
  }
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)
  return (
    <Document>
      <h1>Unexpected error</h1>
      <p className="usa-intro">An unexpected error occurred:</p>
      <Highlight language="text" code={error.stack || error.toString()} />
      <ButtonGroup>
        <Link to="/" className="usa-button">
          Go home
        </Link>
      </ButtonGroup>
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
