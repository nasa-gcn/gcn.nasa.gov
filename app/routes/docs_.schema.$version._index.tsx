/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link } from '@remix-run/react'

export default function () {
  return (
    <>
      <h2>Schema Browser</h2>
      <p className="usa-paragraph">
        Browse the schema definitions for GCN Notices as distributed by GCN
        Kafka. Choose an option below to navigate through the schema directory
        or inspect a schema for additional details.
      </p>
      <p className="usa-paragraph">
        Schema are one step in the process for setting up New Notice Producers.
        We have designed a set of core schema which serve as the building blocks
        for new GCN Notices. Instrument-specific schema can also be created, but
        we request that you utilize the core schema as much as possible.
      </p>
      <p className="usa-paragraph">
        We welcome your feedback on the schema! Don't hesitate to open an issue
        on{' '}
        <Link
          className="usa-link"
          rel="external"
          to="https://github.com/nasa-gcn/gcn-schema"
        >
          Github
        </Link>{' '}
        as our documentation is based on the content of the repository.
      </p>
    </>
  )
}
