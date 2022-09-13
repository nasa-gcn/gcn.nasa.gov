/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { useFetcher } from '@remix-run/react'
import { ButtonGroup, Button } from '@trussworks/react-uswds'

interface CardProps {
  requestorEmail: string
  uuid?: string
}

export default function ApprovalRequestCard(userReq: CardProps) {
  const approvalFetcher = useFetcher()
  const rejectFetcher = useFetcher()
  const reportFetcher = useFetcher()

  const disabled =
    approvalFetcher.state !== 'idle' ||
    rejectFetcher.state !== 'idle' ||
    reportFetcher.state !== 'idle'
  return (
    <div className="grid-row">
      <div className="tablet:grid-col flex-fill">
        <p className="margin-y-0">
          Requesting User: <strong>{userReq.requestorEmail}</strong>
        </p>
      </div>
      <ButtonGroup className="tablet:grid-col flex-auto flex-align-center">
        <approvalFetcher.Form method="post">
          <input type="hidden" name="intent" value="approved" />
          <input type="hidden" name="id" value={userReq.uuid} />
          <Button type="submit" disabled={disabled}>
            Approve
          </Button>
        </approvalFetcher.Form>
        <rejectFetcher.Form method="post">
          <input type="hidden" name="intent" value="rejected" />
          <input type="hidden" name="id" value={userReq.uuid} />
          <Button type="submit" outline disabled={disabled}>
            Reject
          </Button>
        </rejectFetcher.Form>
        <reportFetcher.Form method="post">
          <input type="hidden" name="intent" value="reported" />
          <input type="hidden" name="id" value={userReq.uuid} />
          <Button type="submit" secondary disabled={disabled}>
            Reject and Report
          </Button>
        </reportFetcher.Form>
      </ButtonGroup>
    </div>
  )
}
