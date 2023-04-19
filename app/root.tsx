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
  LinksFunction,
  V2_MetaFunction,
} from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  useMatches,
  useNavigation,
  useRouteError,
} from '@remix-run/react'
import { ButtonGroup, GovBanner, GridContainer } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'
import TopBarProgress from 'react-topbar-progress-indicator'
import { useSpinDelay } from 'spin-delay'

import { DevBanner } from './components/DevBanner'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import NewsBanner from './components/NewsBanner'
import {
  getEnvOrDieInProduction,
  getFeatures,
  getOrigin,
} from './lib/env.server'
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

export const meta: V2_MetaFunction = () => {
  return [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
  ]
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
  const recaptchaSiteKey = getEnvOrDieInProduction('RECAPTCHA_SITE_KEY')

  return { origin, email, features, recaptchaSiteKey }
}

/** Don't reevaluate this route's loader due to client-side navigations. */
export function shouldRevalidate() {
  return false
}

function useLoaderDataRoot() {
  return useRouteLoaderData<typeof loader>('root')
}

export function useEmail() {
  const { email } = useLoaderDataRoot()
  return email
}

export function useRecaptchaSiteKey() {
  const { recaptchaSiteKey } = useLoaderDataRoot()
  return recaptchaSiteKey
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
  const featureUppercase = feature.toUpperCase()
  return useLoaderDataRoot().features.includes(featureUppercase)
}

export function WithFeature({
  children,
  ...features
}: {
  children: ReactNode
} & Record<string, boolean>) {
  return <>{useFeature(Object.keys(features)[0]) && children}</>
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
        <GovBanner />
        <DevBanner />
        <Header />
        <NewsBanner message="GCN Circulars are now part of the new GCN!" />
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

function ErrorUnexpected({ children }: { children?: ReactNode }) {
  return (
    <Document>
      <h1>Unexpected error {children}</h1>
      <p className="usa-intro">An unexpected error occurred.</p>
      <ButtonGroup>
        <Link to="/" className="usa-button">
          Go home
        </Link>
      </ButtonGroup>
    </Document>
  )
}

function ErrorUnauthorized() {
  const url = useUrl()
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
}

function ErrorNotFound() {
  return (
    <Document>
      <h1>Page not found</h1>
      <p className="usa-intro">
        We're sorry, we can't find the page you're looking for. It might have
        been removed, changed its name, or is otherwise unavailable.
      </p>
      <p className="usa-paragraph">
        Visit our homepage for helpful tools and resources, or contact us and
        we'll point you in the right direction.
      </p>
      <ButtonGroup>
        <Link to="/" className="usa-button">
          Visit homepage
        </Link>
        <Link to="/contact" className="usa-button usa-button--outline">
          Contact us
        </Link>
      </ButtonGroup>
    </Document>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 403:
        return <ErrorUnauthorized />
      case 404:
        return <ErrorNotFound />
      default:
        return <ErrorUnexpected>HTTP {error.status}</ErrorUnexpected>
    }
  } else {
    console.error(error)
    return <ErrorUnexpected />
  }
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}
