/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Grid, Icon } from '@trussworks/react-uswds'
import SegmentedCards from '~/components/SegmentedCards'
import TimeAgo from '~/components/TimeAgo'
import { getFormDataString } from '~/lib/utils'
import { EmailNotificationVendingMachine } from '../email_notifications.server'

function sendTestEmail(id?: string): void {
  console.log(id)
}

export async function action({ request }: DataFunctionArgs) {
  //const { uuid } = Object.fromEntries(new URL(request.url).searchParams)
  const [data] = await Promise.all([request.formData()])
  const uuid = getFormDataString(data, 'uuid')
  if (uuid) {
    const machine = await EmailNotificationVendingMachine.create(request)
    await machine.deleteEmailNotification(uuid)
  }
  return redirect('/user/notifications')
}

export async function loader({ request }: DataFunctionArgs) {
  const machine = await EmailNotificationVendingMachine.create(request)
  const data = await machine.getEmailNotifications()
  return data
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return (
    <>
      <div className="tablet:grid-col-2 flex-auto flex-align-self-center display-flex">
        <Link
          className="usa-button margin-left-auto margin-right-0 flex-auto"
          to="edit"
        >
          <Icon.Add className="bottom-aligned margin-right-05" />
          Add
        </Link>
      </div>
      {data ? (
        <SegmentedCards>
          {data.map((alert) => (
            <Grid key={alert.uuid} row>
              <div className="tablet:grid-col flex-fill">
                <div className="segmented-card-headline">
                  <h3 className="usa-card__heading margin-right-1">
                    {alert.name}
                  </h3>
                  <p>
                    <small className="text-base-light">
                      Created <TimeAgo time={alert.created}></TimeAgo>
                    </small>
                  </p>
                </div>
                <div className="display-flex">
                  <small>Recipient: {alert.recipient}</small>
                </div>
                <div className="display-flex">
                  <small>Notice Format: {alert.format}</small>
                </div>
                <div className="display-flex">
                  <small>Notice Types: {alert.noticeTypes.join(', ')}</small>
                </div>
              </div>
              <div className="tablet:grid-col flex-auto">
                <ButtonGroup>
                  <Button
                    type="button"
                    onClick={() => sendTestEmail(alert.uuid)}
                    outline
                  >
                    <Icon.MailOutline className="bottom-aligned margin-right-05" />
                    Test Message
                  </Button>
                  <Link
                    to={`edit?uuid=${alert.uuid}`}
                    className="usa-button usa-button--outline"
                  >
                    <Icon.Edit className="bottom-aligned margin-right-05" />
                    Edit
                  </Link>
                  <Form method="post">
                    <input type="hidden" name="uuid" value={alert.uuid} />
                    <Button type="submit" secondary>
                      <Icon.Delete className="bottom-aligned margin-right-05" />
                      Delete
                    </Button>
                  </Form>
                </ButtonGroup>
              </div>
            </Grid>
          ))}
        </SegmentedCards>
      ) : null}
    </>
  )
}
