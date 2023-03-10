/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Link } from '@remix-run/react'

import gcn_diagram from '~/img/gcn-diagram.jpg'

export function Hero() {
  return (
    <div
      className="grid-row usa-hero margin-0 padding-0 bg-base-darkest"
      style={{ backgroundImage: 'none' }}
    >
      <div className="bg-base-darkest padding-4 tablet:grid-col-5">
        <h1 className="usa-hero__heading">
          <span className="usa-hero__heading--alt">The new GCN:</span>{' '}
          Multimessenger astronomy alerts delivered over Kafka
        </h1>
        <p className="usa-paragraph text-base-lightest">
          GCN distributes alerts between space- and ground-based observatories,
          physics experiments, and thousands of astronomers around the world.
        </p>
        <Link to="/quickstart" className="usa-button">
          <>Start streaming GCN Notices</>
        </Link>
      </div>
      <img
        src={gcn_diagram}
        className="hero-image-right tablet:grid-col-7 padding-4"
        alt="GCN Diagram"
      />
    </div>
  )
}
