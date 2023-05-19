/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs, SerializeFrom } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { ButtonGroup, Grid, Icon } from '@trussworks/react-uswds'

import { formatDateISO } from './circulars.lib'
import { get } from './circulars.server'
import TimeAgo from '~/components/TimeAgo'
import { publicStaticCacheControlHeaders } from '~/lib/headers.server'

export const handle = {
  breadcrumb({
    data: { circularId, subject },
  }: {
    data: SerializeFrom<typeof loader>
  }) {
    return `${circularId}: ${subject}`
  },
}

export async function loader({ params: { circularId } }: DataFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  const result = await get(parseInt(circularId))
  return json(result, {
    headers: publicStaticCacheControlHeaders,
  })
}

export default function () {
  const { circularId, subject, submitter, createdOn, body } =
    useLoaderData<typeof loader>()
  return (
    <>
      <ButtonGroup>
        <Link to="/circulars" className="usa-button">
          <div className="position-relative">
            <Icon.ArrowBack className="position-absolute top-0 left-0" />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
        </Link>
        <ButtonGroup type="segmented">
          <Link
            to="raw"
            className="usa-button usa-button--outline"
            reloadDocument
          >
            Raw
          </Link>
          <Link
            to="json"
            className="usa-button usa-button--outline"
            reloadDocument
          >
            JSON
          </Link>
        </ButtonGroup>
      </ButtonGroup>
      <h1>GCN Circular {circularId}</h1>
      <Grid row>
        <Grid tablet={{ col: 1 }}>
          <b>Subject</b>
        </Grid>
        <Grid col="fill">{subject}</Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 1 }}>
          <b>Date</b>
        </Grid>
        <Grid col="fill">
          {formatDateISO(createdOn)}{' '}
          <small className="text-base-light">
            (<TimeAgo time={createdOn}></TimeAgo>)
          </small>
        </Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 1 }}>
          <b>From</b>
        </Grid>
        <Grid col="fill">{submitter}</Grid>
      </Grid>
      <div className="text-pre-wrap margin-top-2">{body}</div>
    </>
  )
}
