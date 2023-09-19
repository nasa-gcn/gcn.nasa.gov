/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import { Form, Link, useSearchParams } from '@remix-run/react'
import { Button, ButtonGroup, FormGroup, Label } from '@trussworks/react-uswds'
import { useState } from 'react'

import type { NoticeFormat } from '~/components/NoticeFormat'
import { NoticeFormatInput } from '~/components/NoticeFormat'
import { NoticeTypeCheckboxes } from '~/components/NoticeTypeCheckboxes'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'GCN - Start Streaming GCN Notices - Customize Alerts',
  getSitemapEntries: () => null,
}

export default function () {
  const [params] = useSearchParams()
  const [alertsValid, setAlertsValid] = useState(false)
  const clientId = params.get('clientId') || undefined
  const [format, setFormat] = useState<NoticeFormat>('text')

  return (
    <Form method="GET" action="../code">
      <p className="usa-paragraph">
        Choose how you would like your results returned. Select a Format and
        Notice type for each alert you would like to subscribe to. More details
        on the Notice Types can be found their respective pages under{' '}
        <Link to="/missions">Missions</Link>.
      </p>
      <Label htmlFor="noticeFormat">Notice Format</Label>
      <NoticeFormatInput
        name="noticeFormat"
        value={format}
        showJson={true}
        onChange={setFormat}
      />
      <Label htmlFor="noticeTypes">Notice Type</Label>
      <NoticeTypeCheckboxes
        selectedFormat={format}
        validationFunction={setAlertsValid}
      />
      <input type="hidden" name="clientId" value={clientId} />
      <FormGroup>
        <ButtonGroup>
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
        </ButtonGroup>
      </FormGroup>
    </Form>
  )
}
