/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { Form, Link, useSearchParams } from '@remix-run/react'
import { Button, Label } from '@trussworks/react-uswds'
import { useState } from 'react'

import { NoticeFormatInput } from '~/components/NoticeFormat'
import { NoticeTypeCheckboxes } from '~/components/NoticeTypeCheckboxes'

export const handle = {
  breadcrumb: 'GCN - Start Streaming GCN Notices - Customize Alerts',
  getSitemapEntries: () => null,
}

export default function () {
  const [params] = useSearchParams()
  const [alertsValid, setAlertsValid] = useState(false)
  const clientId = params.get('clientId') || undefined

  return (
    <Form method="GET" action="../code">
      <p className="usa-paragraph">
        Choose how you would like your results returned. Select a Format and
        Notice type for each alert you would like to subscribe to. More details
        on the Notice Types can be found their respective pages under{' '}
        <Link to="/missions">Missions</Link>.
      </p>
      <Label htmlFor="noticeFormat">Notice Format</Label>
      <NoticeFormatInput name="noticeFormat" value="text" />
      <Label htmlFor="noticeTypes">Notice Type</Label>
      <NoticeTypeCheckboxes validationFunction={setAlertsValid} />
      <input type="hidden" name="clientId" value={clientId} />
      <Link
        to="../credentials"
        type="button"
        className="usa-button usa-button--outline"
      >
        Back
      </Link>
      <Button disabled={!alertsValid} type="submit">
        Generate Code
      </Button>
    </Form>
  )
}
