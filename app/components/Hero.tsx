/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Link } from '@remix-run/react'

export function Hero() {
  return (
    <div
      className="grid-row usa-hero margin-0 padding-0"
      style={{ backgroundImage: 'none' }}
    >
      <div className="tablet:grid-col-6 bg-base-darkest padding-4">
        <h1 className="usa-hero__heading">
          <span className="usa-hero__heading--alt">The new GCN:</span>{' '}
          Multimessenger astronomy alerts delivered over Kafka
        </h1>
        <p className="text-base-lightest">
          GCN distributes alerts between space- and ground-based observatories,
          physics experiments, and thousands of astronomers around the world.
        </p>
        <Link to="/user/streaming_steps" className="usa-button">
          Start streaming GCN Notices
        </Link>
      </div>
      <img
        src="https://gcn.gsfc.nasa.gov/GCN.gif"
        className="tablet:grid-col-6"
        alt="GCN Diagram"
      />
    </div>
  )
}
