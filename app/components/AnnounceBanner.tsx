/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Button } from '@trussworks/react-uswds'
import { useState } from 'react'
import AnnouncementContent from './AnnouncementContent'

export default function AnnounceBanner() {
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
              <h2 className="usa-banner__header-text">
                We invite you to join one of our three public Zoom webinars for
                an overview of the new GCN.
              </h2>
            </div>
            {showFullBanner ? (
              <Button
                type="button"
                className="usa-banner__button"
                onClick={toggleShowBanner}
              >
                <span className="usa-banner__button-text">Show Less</span>
              </Button>
            ) : (
              <Button
                type="button"
                className="usa-banner__button"
                onClick={toggleShowBanner}
              >
                <span className="usa-banner__button-text">Show More</span>
              </Button>
            )}
          </div>
        </header>
        {showFullBanner ? (
          <div
            className="usa-banner__content usa-accordion__content padding-top-2"
            id="announcement-banner-blue"
          >
            <AnnouncementContent />
          </div>
        ) : null}
      </div>
    </section>
  )
}
