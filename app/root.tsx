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

import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useMatches,
  useNavigation,
} from '@remix-run/react'
import type {
  MetaFunction,
  LinksFunction,
  DataFunctionArgs,
} from '@remix-run/node'
import { ButtonGroup, GovBanner, GridContainer } from '@trussworks/react-uswds'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { DevBanner } from './components/DevBanner'
import { useSpinDelay } from 'spin-delay'
import { getUser } from './routes/__auth/user.server'
import themeStyle from './theme/css/custom.css'
import highlightStyle from 'highlight.js/styles/github.css'
import TopBarProgress from 'react-topbar-progress-indicator'

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
import { useRouteLoaderData } from './lib/remix'
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
  const { url } = request

  const user = await getUser(request)
  const email = user?.email
  const features = getFeatures()

  return { url, email, features }
}

function getFeatures() {
  return process.env.GCN_FEATURES?.split(',') ?? []
}

/**
 * Return true if the given feature flag is enabled.
 *
 * Feature flags are configured by the environment variable GCN_FEATURES, which
 * is a comma-separated list of enabled features.
 */
export function feature(feature: string) {
  return getFeatures().includes(feature)
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
  return useLoaderDataRoot().url
}

export function useHostname() {
  return new URL(useUrl()).hostname
}

function Document({ children }: { children?: React.ReactNode }) {
  const { email } = useLoaderDataRoot()
  const matches = useMatches()
  const navigation = useNavigation()
  const showProgress = useSpinDelay(navigation.state !== 'idle')
  const breadcrumbs = matches
    .map(({ handle }) => handle?.breadcrumb)
    .filter(Boolean)
  const title = breadcrumbs.join(' - ')

  return (
    <html lang="en-US">
      <head>
        <Meta />
        <Links />
        <title>{title}</title>
      </head>
      <body>
        <a className="usa-skipnav" href="#main-content">
          Skip to main content
        </a>
        {showProgress && <TopBarProgress />}
        <GovBanner />
        <DevBanner />
        <Header email={email} />
        <div className="bg-gold padding-x-2 desktop:padding-x-4 padding-y-1 line-height-sans-3 font-lang-4">
          <GridContainer>
            <span className="text-bold">
              GECAM Notices are here! Receive them via Kafka or email.
            </span>{' '}
            See{' '}
            <Link to="/news" className="hover:text-no-underline">
              news and announcements
            </Link>
          </GridContainer>
        </div>
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
  const [{ data }] = useMatches()
  if (status == 403) {
    const { url } = data as Awaited<ReturnType<typeof loader>>
    return (
      <Document>
        <h1>Unauthorized</h1>
        <p className="usa-intro">
          We're sorry, you must log in to access the page you're looking for.
        </p>
        <p>Log in to access that page, or go home.</p>
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

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}
