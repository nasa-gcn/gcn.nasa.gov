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
  useTransition,
} from '@remix-run/react'
import type {
  MetaFunction,
  LinksFunction,
  DataFunctionArgs,
} from '@remix-run/node'
import { ButtonGroup, GovBanner, GridContainer } from '@trussworks/react-uswds'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import highlightStyle from 'highlight.js/styles/github.css'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DevBanner } from './components/DevBanner'
import { useSpinDelay } from 'spin-delay'
import { getUser } from './routes/__auth/user.server'
import React from 'react'

TopBarProgress.config({
  barColors: {
    '0': '#e52207',
    '0.5': '#ffffff',
    '1.0': '#0050d8',
  },
})

export const meta: MetaFunction = () => {
  return {
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1',
    title: 'GCN - General Coordinates Network',
  }
}

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: '/_static/theme/css/custom.css',
  },
  {
    rel: 'stylesheet',
    href: highlightStyle,
  },
  ...[16, 40, 57, 72, 114, 144, 192].map((size) => ({
    rel: 'icon',
    href: `/_static/theme/img/favicons/favicon-${size}.png`,
    sizes: `${size}x${size}`,
  })),
]

export async function loader({ request }: DataFunctionArgs) {
  const { url } = request

  const user = await getUser(request)
  const email = user?.email

  return { url, email }
}

export function useUrl() {
  const [{ data }] = useMatches()
  const { url } = data as Awaited<ReturnType<typeof loader>>
  return url
}

export function useHostname() {
  return new URL(useUrl()).hostname
}

function Document({ children }: { children?: React.ReactNode }) {
  const [{ data }] = useMatches()
  const { email } = data as Awaited<ReturnType<typeof loader>>
  const transition = useTransition()
  const showProgress = useSpinDelay(transition.state !== 'idle')

  return (
    <html lang="en-US">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <a className="usa-skipnav" href="#main-content">
          Skip to main content
        </a>
        {showProgress && <TopBarProgress />}
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
    ;<Document>
      <h1>Unexpected error (HTTP {status}</h1>
      <p className="usa-intro">An unexpected error occurred.</p>
      <ButtonGroup>
        <Link to="/" className="usa-button">
          Go home
        </Link>
      </ButtonGroup>
    </Document>
  }
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}
