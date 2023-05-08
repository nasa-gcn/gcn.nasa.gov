/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link } from '@remix-run/react'
import { ButtonGroup, Grid, GridContainer } from '@trussworks/react-uswds'

import gcn_diagram from '~/img/gcn-diagram.jpg'

export function Hero() {
  return (
    <div className="bg-base-darkest">
      <GridContainer>
        <Grid
          row
          className="usa-hero margin-0 padding-0"
          style={{ backgroundImage: 'none' }}
        >
          <div className="bg-base-darkest padding-4 tablet:grid-col-5">
            <h1 className="usa-hero__heading">
              <span className="usa-hero__heading--alt">GCN:</span> NASA's
              Time-Domain and Multimessenger Alert System
            </h1>
            <p className="usa-paragraph text-base-lightest">
              GCN distributes alerts between space- and ground-based
              observatories, physics experiments, and thousands of astronomers
              around the world.
            </p>
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
          </div>
          <img
            src={gcn_diagram}
            className="hero-image-right tablet:grid-col-7 padding-4"
            alt="GCN Diagram"
          />
        </Grid>
      </GridContainer>
    </div>
  )
}
