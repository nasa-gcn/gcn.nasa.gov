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
import { CircularsServer } from './circulars.server'

export async function loader({ request, params }: DataFunctionArgs) {
  const id = params.circularId
  if (!id) throw new Response('Id is required', { status: 404 })
  const server = await CircularsServer.create(request)
  const circular = await server.get(parseInt(id))
  return { circular }
}

export default function $circularId() {
  const { circular } = useLoaderData<typeof loader>()
  return (
    <>
      <h2>{circular.subject}</h2>
      <small className="text-base-light">
        <TimeAgo time={circular.createdOn}></TimeAgo>
      </small>
      <div className="text-pre-wrap ">{circular.body}</div>
    </>
  )
}
