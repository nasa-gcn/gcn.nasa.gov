/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Grid, Icon } from '@trussworks/react-uswds'
import SegmentedCards from '~/components/SegmentedCards'
import TimeAgo from '~/components/TimeAgo'
import { getFormDataString } from '~/lib/utils'
import { EmailNotificationVendingMachine } from '../email_notifications.server'

export async function action({ request }: DataFunctionArgs) {
  const [data] = await Promise.all([request.formData()])
  const uuid = getFormDataString(data, 'uuid')
  const intent = getFormDataString(data, 'intent')
  console.log(intent)
  switch (intent) {
    case 'delete':
      if (uuid) {
        const machine = await EmailNotificationVendingMachine.create(request)
        await machine.deleteEmailNotification(uuid)
      }
    case 'sendTest':
      const recipient = getFormDataString(data, 'recipient')
      console.log(recipient)
      if (recipient) {
        const machine = await EmailNotificationVendingMachine.create(request)
        await machine.sendTestEmail(recipient)
      }
  }
  return redirect('/user/email')
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
      <div className="tablet:grid-col-2 flex-auto flex-align-self-center display-flex tablet:margin-right-2">
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
              <Grid row className="full-width-span">
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
                </div>
                <div className="tablet:grid-col flex-auto">
                  <ButtonGroup>
                    <Form method="post">
                      <input
                        type="hidden"
                        name="recipient"
                        value={alert.recipient}
                      />
                      <input type="hidden" name="intent" value="sendTest" />
                      <Button type="submit" outline>
                        <Icon.MailOutline className="bottom-aligned margin-right-05" />
                        Test Message
                      </Button>
                    </Form>
                    <Link
                      to={`edit?uuid=${alert.uuid}`}
                      className="usa-button usa-button--outline"
                    >
                      <Icon.Edit className="bottom-aligned margin-right-05" />
                      Edit
                    </Link>
                    <Form method="post">
                      <input type="hidden" name="uuid" value={alert.uuid} />
                      <input type="hidden" name="intent" value="delete" />
                      <Button type="submit" secondary>
                        <Icon.Delete className="bottom-aligned margin-right-05" />
                        Delete
                      </Button>
                    </Form>
                  </ButtonGroup>
                </div>
              </Grid>
              <Grid row>
                <div className="tablet:maxw-tablet maxw-card-lg display-flex height-205 overflow-hidden">
                  <small className="notice-types-overflow">
                    Notice Types: {alert.noticeTypes.join(', ')}
                  </small>
                </div>
              </Grid>
            </Grid>
          ))}
        </SegmentedCards>
      ) : null}
    </>
  )
}
