/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Button, Link } from '@trussworks/react-uswds'
import { useState } from 'react'

type AnnouncedEvents = {
  time: string
  link: string
  region: 'Atlantic' | 'Pacific' | 'Asia and Oceania'
}

export default function AnnounceBanner({
  message,
  events,
}: {
  message: string
  events?: AnnouncedEvents[]
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
            {events && (
              <div className="grid-row">
                {events.map((event) => (
                  <AnnouncementEvent key={event.link} {...event} />
                ))}
              </div>
            )}
            <p>
              If you cannot attend live, then you can get the{' '}
              <Link
                rel="external"
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

export function AnnouncementEvent(event: AnnouncedEvents) {
  return (
    <div className="mobile-lg:grid-col-4">
      {event.time}
      <div>(best for {event.region}):</div>
      <Link rel="external" href={event.link}>
        {event.link}
      </Link>
    </div>
  )
}
