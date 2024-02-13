/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Grid } from '@trussworks/react-uswds'

import { getUser } from './_gcn._auth/user.server'
import type { CircularChangeRequest } from './_gcn.circulars/circulars.lib'
import {
  getChangeRequests,
  moderatorGroup,
} from './_gcn.circulars/circulars.server'
import SegmentedCards from '~/components/SegmentedCards'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const changeRequests = await getChangeRequests()
  return {
    changeRequests,
  }
}

export default function () {
  const { changeRequests } = useLoaderData<typeof loader>()

  return (
    <>
      <h2>Pending Corrections</h2>
      <SegmentedCards>
        {changeRequests.map((correction) => (
          <CircularChangeRequestRow
            key={`${correction.circularId}-${correction.requestor}`}
            changeRequest={correction}
          />
        ))}
      </SegmentedCards>
    </>
  )
}

function CircularChangeRequestRow({
  changeRequest,
}: {
  changeRequest: CircularChangeRequest
}) {
  return (
    <Grid row>
      <div className="tablet:grid-col flex-fill">
        <div>
          <strong>Circular: </strong>
          {changeRequest.circularId}
        </div>
        <div>
          <strong>Requestor: </strong>
          {changeRequest.requestor}
        </div>
      </div>
      <div className="tablet:grid-col flex-auto margin-y-auto">
        <Link
          to={`${changeRequest.circularId}/${changeRequest.requestorSub}`}
          className="usa-button usa-button--outline"
        >
          Review
        </Link>
      </div>
    </Grid>
  )
}
