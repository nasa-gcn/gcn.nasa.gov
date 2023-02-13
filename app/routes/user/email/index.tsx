/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Icon } from '@trussworks/react-uswds'
import EmailNotificationCard from '~/components/EmailNotificationCard'
import SegmentedCards from '~/components/SegmentedCards'
import { getFormDataString } from '~/lib/utils'
import { EmailNotificationServer } from '../email_notifications.server'

export const handle = { getSitemapEntries: () => null }

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const uuid = getFormDataString(data, 'uuid')
  const intent = getFormDataString(data, 'intent')
  switch (intent) {
    case 'delete':
      if (uuid) {
        const machine = await EmailNotificationServer.create(request)
        await machine.deleteEmailNotification(uuid)
      }
    case 'sendTest':
      const recipient = getFormDataString(data, 'recipient')
      if (recipient) {
        const machine = await EmailNotificationServer.create(request)
        await machine.sendTestEmail(recipient)
      }
  }
  return redirect('/user/email')
}

export async function loader({ request }: DataFunctionArgs) {
  const machine = await EmailNotificationServer.create(request)
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
      <p>
        Create and manage email subscriptions to GCN Notices here. You can
        create as many subscriptions as you like. To create a new alert, click
        the "Add" button. Once an alert has been created, you can click the
        "Test Message" button to send a test email to the listed recipient, to
        verify that the emails will make it into your inbox.
      </p>
      <p>
        Note that signing up here does not affect prior subscriptions on the old
        web site,{' '}
        <a rel="external" href="https://gcn.gsfc.nasa.gov/">
          https://gcn.gsfc.nasa.gov/
        </a>
        . To unsubscribe from your GCN Classic Notice subscriptions, please{' '}
        <a
          rel="external"
          href="https://heasarc.gsfc.nasa.gov/cgi-bin/Feedback?selected=gcnclassic"
        >
          send us a message
        </a>
        .
      </p>
      {data && (
        <SegmentedCards>
          {data.map((alert) => (
            <EmailNotificationCard key={alert.uuid} {...alert} />
          ))}
        </SegmentedCards>
      )}
    </>
  )
}
