/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type {
  DataFunctionArgs,
  HeadersFunction,
  SerializeFrom,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { ButtonGroup, Grid, Icon } from '@trussworks/react-uswds'

import { formatDateISO } from './circulars/circulars.lib'
import { get } from './circulars/circulars.server'
import TimeAgo from '~/components/TimeAgo'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import { useSearchString } from '~/lib/utils'

export const handle = {
  breadcrumb({ data }: { data: SerializeFrom<typeof loader> }) {
    if (data) {
      const { circularId, subject } = data
      return `${circularId}: ${subject}`
    }
  },
}

export async function loader({ params: { circularId } }: DataFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  const result = await get(parseFloat(circularId))
  return json(result, {
    headers: getCanonicalUrlHeaders(
      new URL(`/circulars/${circularId}`, origin)
    ),
  })
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

const submittedHowMap = {
  web: 'Web form',
  email: 'email',
  'email-legacy': 'legacy email',
}

export default function () {
  const { circularId, subject, submitter, createdOn, body, submittedHow } =
    useLoaderData<typeof loader>()
  const searchString = useSearchString()
  return (
    <>
      <ButtonGroup>
        <Link to={`/circulars${searchString}`} className="usa-button">
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
        <Grid tablet={{ col: 2 }}>
          <b>Subject</b>
        </Grid>
        <Grid col="fill">{subject}</Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 2 }}>
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
        <Grid tablet={{ col: 2 }}>
          <b>From</b>
        </Grid>
        <Grid col="fill">{submitter}</Grid>
      </Grid>
      {submittedHow && (
        <Grid row>
          <Grid tablet={{ col: 2 }}>
            <b>Submitted By</b>
          </Grid>
          <Grid col="fill">{submittedHowMap[submittedHow]}</Grid>
        </Grid>
      )}
      <div className="text-pre-wrap margin-top-2">{body}</div>
    </>
  )
}
