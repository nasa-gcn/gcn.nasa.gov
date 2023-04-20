/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Grid } from '@trussworks/react-uswds'

import { get } from './circulars.server'
import TimeAgo from '~/components/TimeAgo'
import { publicStaticCacheControlHeaders } from '~/lib/utils'

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
      <Link to="/circulars">back to archive</Link>
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
          {new Date(createdOn).toISOString()}{' '}
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
