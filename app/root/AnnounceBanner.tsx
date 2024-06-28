/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Button, Grid, Link } from '@trussworks/react-uswds'
import { useState } from 'react'

export default function AnnounceBanner({
  message,
  children,
}: {
  message: React.ReactNode
  children?: React.ReactNode
}) {
  const [showFullBanner, setShowFullBanner] = useState(true)

  function toggleShowBanner() {
    setShowFullBanner(!showFullBanner)
  }

  return (
    <section
      className="usa-banner bg-accent-cool-lighter"
      aria-label="Official announcement"
    >
      <div className="usa-accordion">
        <header className="usa-banner__header">
          <div className="usa-banner__inner">
            <div className="grid-col-fill tablet:grid-col-auto">
              <h2 className="usa-banner__header-text">{message}</h2>
            </div>
            <Button
              type="button"
              className="usa-banner__button"
              aria-expanded={showFullBanner}
              onClick={toggleShowBanner}
            >
              <span className="usa-banner__button-text">
                Show {showFullBanner ? 'less' : 'more'}
              </span>
            </Button>
          </div>
        </header>
        {showFullBanner && (
          <div
            className="usa-banner__content usa-accordion__content padding-top-2"
            id="announcement-banner-blue"
          >
            <Grid row>{children}</Grid>
            <p>
              If you cannot attend live, then you can get the{' '}
              <Link
                rel="external noopener"
                target="_blank"
                href="https://nasa-gcn.github.io/gcn-presentation/"
              >
                presentation
              </Link>{' '}
              at any time.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export function AnnouncementEvent(props: {
  time: string
  link: string
  linkstring: string
  region: 'Atlantic' | 'Pacific' | 'Asia and Oceania'
}) {
  return (
    <Grid mobileLg={{ col: 4 }}>
      {props.time}
      <div>(best for {props.region}):</div>
      <Link rel="external noopener" target="_blank" href={props.link}>
        {props.linkstring}
      </Link>
    </Grid>
  )
}
