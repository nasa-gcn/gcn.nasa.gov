/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, useSearchParams } from '@remix-run/react'
import { Button, Icon } from '@trussworks/react-uswds'

export default function () {
  const [searchParams] = useSearchParams()
  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`
  return (
    <>
      <div className="display-flex flex-justify-space-between flex-align-center">
        <h1>GCN Circulars</h1>
        <div className="margin-left-auto">
          <Link to={`/circulars/new${searchString}`}>
            <Button type="button" className="padding-y-1">
              <Icon.Edit role="presentation" /> Submit New Circular
            </Button>
          </Link>
        </div>
      </div>
      <p className="usa-paragraph">
        <b>
          GCN Circulars are rapid astronomical bulletins submitted by and
          distributed to community members worldwide.
        </b>{' '}
        They are used to share discoveries, observations, quantitative near-term
        predictions, requests for follow-up observations, or future observing
        plans related to high-energy, multi-messenger, and variable or transient
        astrophysical events. See the{' '}
        <Link className="usa-link" to="/docs/circulars">
          documentation
        </Link>{' '}
        for help with subscribing to or submitting Circulars.
      </p>
    </>
  )
}
