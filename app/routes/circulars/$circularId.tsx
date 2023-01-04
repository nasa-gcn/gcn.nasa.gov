/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import TimeAgo from '~/components/TimeAgo'
import { get } from './circulars.server'

export async function loader({ params: { circularId } }: DataFunctionArgs) {
  if (!circularId)
    throw new Response('circularId must be defined', { status: 400 })
  return get(parseInt(circularId))
}

export default function $circularId() {
  const { subject, submitter, createdOn, body } = useLoaderData<typeof loader>()
  return (
    <>
      <h2>{subject}</h2>
      <h4>{submitter}</h4>
      <small className="text-base-light">
        <TimeAgo time={createdOn}></TimeAgo>
      </small>
      <div className="text-pre-wrap ">{body}</div>
    </>
  )
}
