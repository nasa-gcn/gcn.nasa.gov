/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, Checkbox, Grid } from '@trussworks/react-uswds'
import { useState } from 'react'

import { getUser } from './_auth/user.server'
import type {
  Circular,
  CircularChangeRequest,
  CircularChangeRequestKeys,
} from './circulars/circulars.lib'
import {
  bulkDeleteChangeRequests,
  get,
  getChangeRequests,
  moderatorGroup,
} from './circulars/circulars.server'
import SegmentedCards from '~/components/SegmentedCards'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  noIndex: true,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const changeRequests = await getChangeRequests()
  const circulars = await Promise.all(
    changeRequests.map((request) => get(request.circularId))
  )
  return {
    changeRequests,
    circulars,
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

  await bulkDeleteChangeRequests(selectedItems, user)
  return null
}

export default function () {
  const { changeRequests, circulars } = useLoaderData<typeof loader>()
  const [selectedCount, setSelectedCount] = useState(0)

  function checkboxOnChange(checked: boolean) {
    if (checked) {
      setSelectedCount((value) => value + 1)
    } else {
      setSelectedCount((value) => value - 1)
    }
  }

  return (
    <>
      <h2>Pending Corrections</h2>
      <Form method="POST">
        <ToolbarButtonGroup>
          <Link to="/circulars" className="usa-button usa-button--outline">
            Back
          </Link>
          <Button type="submit" secondary disabled={selectedCount === 0}>
            Delete Selected
          </Button>
        </ToolbarButtonGroup>
        <SegmentedCards>
          {changeRequests.map((correction, index) => (
            <CircularChangeRequestRow
              key={`${correction.circularId}-${correction.requestor}`}
              changeRequest={correction}
              circular={circulars[index]}
              checkboxOnChange={checkboxOnChange}
            />
          ))}
        </SegmentedCards>
      </Form>
    </>
  )
}

function CircularChangeRequestRow({
  changeRequest,
  circular,
  checkboxOnChange,
}: {
  changeRequest: CircularChangeRequest
  circular: Awaited<ReturnType<typeof get>>
  checkboxOnChange: (checked: boolean) => void
}) {
  const modifiedFields = getModifiedFields(circular, changeRequest)

  return (
    <Grid row>
      <div className="tablet:grid-col flex-fill">
        <Checkbox
          id={`${changeRequest.circularId}::${changeRequest.requestorSub}`}
          name="bulkItems"
          value={`${changeRequest.circularId}::${changeRequest.requestorSub}`}
          onChange={(e) => {
            checkboxOnChange(e.target.checked)
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
              {changeRequest.zendeskTicketId && (
                <div>
                  <strong>Zendesk Ticket: </strong>
                  <a
                    href={`https://nasa-gcn.zendesk.com/agent/tickets/${changeRequest.zendeskTicketId}`}
                    target="_blank"
                    rel="external noopener"
                  >
                    {changeRequest.zendeskTicketId}
                  </a>
                </div>
              )}
              {modifiedFields.length > 0 && (
                <div>
                  <strong>Modified Fields: </strong>
                  {modifiedFields.join(', ')}
                </div>
              )}
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

function getModifiedFields(
  circular: Circular,
  changeRequest: CircularChangeRequest
) {
  const excludedFields = [
    'submittedHow',
    'format',
    'bibcode',
    'editedOn',
    'createdOn',
    'version',
  ]
  return (Object.keys(circular) as (keyof Circular)[])
    .filter((key) => {
      const changedValue = changeRequest[key as keyof CircularChangeRequest]
      const originalValue = circular[key as keyof Circular]

      return (
        changedValue !== originalValue && !excludedFields.includes(String(key))
      )
    })
    .map((key) => String(key))
}
