/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'
import { ButtonGroup, FormGroup, Grid } from '@trussworks/react-uswds'

import center_cropped from './center-cropped.jpg'

export function Hero() {
  return (
    <Grid row className="bg-base-darkest">
      <div className="usa-hero width-full padding-y-0 gcn-hero-background">
        <Grid
          tablet={{ col: 6 }}
          className="usa-hero__callout maxw-full display-inline-block text-middle"
          style={{ background: 'none' }}
        >
          <h1 className="usa-hero__heading">
            <span className="usa-hero__heading--alt">GCN:</span> NASA's
            Time-Domain and Multimessenger Alert System
          </h1>
          <p className="usa-paragraph text-base-lightest">
            GCN distributes alerts between space- and ground-based
            observatories, physics experiments, and thousands of astronomers
            around the world.
          </p>
          <FormGroup>
            <ButtonGroup>
              <Link to="/quickstart" className="usa-button">
                <>Start streaming GCN Notices</>
              </Link>
              <Link
                to="/circulars"
                className="usa-button usa-button--secondary"
              >
                <>Post a GCN Circular</>
              </Link>
            </ButtonGroup>
          </FormGroup>
        </Grid>
        <Grid
          tablet={{ col: 6 }}
          className="gcn-hero-image display-inline-block tablet:padding-x-2 text-middle"
        >
          <img
            src={center_cropped}
            alt="GCN diagram"
            width="1280"
            height="900"
            loading="lazy"
            style={{ height: 'auto' }}
          />
        </Grid>
      </div>
      <Grid col className="gcn-hero-background-right" />
    </Grid>
  )
}
