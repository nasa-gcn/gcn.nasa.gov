/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react'
import { ButtonGroup, FormGroup, GridContainer } from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

import { Footer } from '~/components/Footer'
import { Header } from '~/components/Header'
import NewsBanner from '~/components/NewsBanner'
import { useUrl } from '~/root'

function Document({ children }: { children?: ReactNode }) {
  return (
    <>
      <Header />
      <NewsBanner>
        New Swift-BAT/GUANO and IceCube Notice Types Available! See{' '}
        <Link
          className="usa-link"
          to="/news#new-swift-bat/guano-and-icecube-notices-available-via-kafka"
        >
          news and announcements
        </Link>
      </NewsBanner>
      <main id="main-content">{children}</main>
      <Footer />
    </>
  )
}

function ErrorUnexpected({ children }: { children?: ReactNode }) {
  return (
    <Document>
      <GridContainer className="usa-section">
        <h1>Unexpected error {children}</h1>
        <p className="usa-intro">An unexpected error occurred.</p>
        <FormGroup>
          <ButtonGroup>
            <Link to="/" className="usa-button">
              Go home
            </Link>
          </ButtonGroup>
        </FormGroup>
      </GridContainer>
    </Document>
  )
}

function ErrorUnauthorized() {
  const url = useUrl()
  return (
    <Document>
      <GridContainer className="usa-section">
        <h1>Unauthorized</h1>
        <p className="usa-intro">
          We're sorry, you must log in to access the page you're looking for.
        </p>
        <p className="usa-paragraph">Log in to access that page, or go home.</p>
        <FormGroup>
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
        </FormGroup>
      </GridContainer>
    </Document>
  )
}

function ErrorNotFound() {
  return (
    <Document>
      <GridContainer className="usa-section">
        <h1>Page not found</h1>
        <p className="usa-intro">
          We're sorry, we can't find the page you're looking for. It might have
          been removed, changed its name, or is otherwise unavailable.
        </p>
        <p className="usa-paragraph">
          Visit our homepage for helpful tools and resources, or contact us and
          we'll point you in the right direction.
        </p>
        <FormGroup>
          <ButtonGroup>
            <Link to="/" className="usa-button">
              Visit homepage
            </Link>
            <Link to="/contact" className="usa-button usa-button--outline">
              Contact us
            </Link>
          </ButtonGroup>
        </FormGroup>
      </GridContainer>
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

export default function () {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}
