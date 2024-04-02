/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Checkbox, Grid } from '@trussworks/react-uswds'
import { useState } from 'react'

import { getUser } from './_auth/user.server'
import type {
  CircularChangeRequest,
  CircularChangeRequestKeys,
} from './circulars/circulars.lib'
import {
  bulkDeleteChangeRequests,
  getChangeRequests,
  moderatorGroup,
} from './circulars/circulars.server'
import SegmentedCards from '~/components/SegmentedCards'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Moderation',
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const changeRequests = await getChangeRequests()
  return {
    changeRequests,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const selectedItems: CircularChangeRequestKeys[] = data
    .getAll('bulkItems')
    .map((x) => {
      const splitValue = x.toString().split('::')
      return {
        circularId: parseFloat(splitValue[0]),
        requestorSub: splitValue[1],
      }
    })

  console.log(selectedItems)
  await bulkDeleteChangeRequests(selectedItems, user)
  return null
}

export default function () {
  const { changeRequests } = useLoaderData<typeof loader>()
  const [disableSubmit, setDisableSubmit] = useState(true)
  const [selectedList, setSelectedList] = useState([])

  return (
    <>
      <h2>Pending Corrections</h2>
      <Form method="POST">
        <ButtonGroup>
          <Link to="/circulars" className="usa-button usa-button--outline">
            Back
          </Link>
          <Button type="submit" secondary disabled={disableSubmit}>
            Bulk Delete
          </Button>
        </ButtonGroup>
        <SegmentedCards>
          {changeRequests.map((correction) => (
            <CircularChangeRequestRow
              key={`${correction.circularId}-${correction.requestor}`}
              changeRequest={correction}
            />
          ))}
        </SegmentedCards>
      </Form>
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
        <Checkbox
          id={`${changeRequest.circularId}::${changeRequest.requestorSub}`}
          name="bulkItems"
          value={`${changeRequest.circularId}::${changeRequest.requestorSub}`}
          onChange={(e) => {
            console.log(e.target.id)
            console.log(e.target.checked)
          }}
          label={
            <>
              <div>
                <strong>Circular: </strong>
                {changeRequest.circularId}
              </div>
              <div>
                <strong>Requestor: </strong>
                {changeRequest.requestor}
              </div>
            </>
          }
        />
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
