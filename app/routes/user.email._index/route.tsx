/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Grid, Icon } from '@trussworks/react-uswds'

import {
  createCircularEmailNotification,
  deleteCircularEmailNotification,
  getUsersCircularSubmissionStatus,
} from '../user.email/email_circulars.server'
import {
  deleteEmailNotification,
  getEmailNotifications,
  sendTestEmail,
} from '../user.email/email_notices.server'
import EmailNotificationCard from './EmailNotificationCard'
import HeadingWithAddButton from '~/components/HeadingWithAddButton'
import SegmentedCards from '~/components/SegmentedCards'
import Spinner from '~/components/Spinner'
import { getFormDataString } from '~/lib/utils'
import { useEmail, useHostname } from '~/root'
import { getUser } from '~/routes/_auth/user.server'

export const handle = { getSitemapEntries: () => null }

export async function action({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const data = await request.formData()
  const uuid = getFormDataString(data, 'uuid')
  const intent = getFormDataString(data, 'intent')

  switch (intent) {
    case 'delete':
      if (uuid) {
        await deleteEmailNotification(uuid, user.sub)
      }
      break
    case 'sendTest':
      const recipient = getFormDataString(data, 'recipient')
      if (recipient) {
        await sendTestEmail(recipient)
      }
      break
    case 'subscribe':
      await createCircularEmailNotification(user.sub, user.email)
      break
    case 'unsubscribe':
      await deleteCircularEmailNotification(user.sub, user.email)
      break
  }
  return null
}

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const data = await getEmailNotifications(user.sub)
  const userIsSubscribedToCircularEmails =
    await getUsersCircularSubmissionStatus(user.sub)

  return { data, userIsSubscribedToCircularEmails }
}

function CircularsSubscriptionForm({ value }: { value: boolean }) {
  const fetcher = useFetcher<typeof action>()

  let valuePending
  switch (fetcher.submission?.formData?.get('intent')?.toString()) {
    case 'subscribe':
      valuePending = true
      break
    case 'unsubscribe':
      valuePending = false
      break
    default:
      valuePending = value
  }

  return (
    <fetcher.Form method="POST" className="tablet:margin-top-105">
      <Grid row className="flex-align-center">
        <div className="padding-1 flex-auto">
          {fetcher.state !== 'idle' && (
            <>
              <Spinner /> Saving...
            </>
          )}
          {fetcher.state === 'idle' && fetcher.data !== undefined && (
            <>
              <Icon.Check role="presentation" color="green" /> Saved
            </>
          )}
        </div>
        <ButtonGroup
          type="segmented"
          className="flex-auto tablet:margin-right-2"
        >
          <Button
            type={value ? 'button' : 'submit'}
            name="intent"
            value="subscribe"
            outline={!valuePending}
          >
            On
          </Button>
          <Button
            type={value ? 'submit' : 'button'}
            name="intent"
            value="unsubscribe"
            outline={valuePending}
          >
            Off
          </Button>
        </ButtonGroup>
      </Grid>
    </fetcher.Form>
  )
}

export default function () {
  const hostname = useHostname()
  const email = useEmail()
  const { data, userIsSubscribedToCircularEmails } =
    useLoaderData<typeof loader>()

  return (
    <>
      <h1>Email Notifications</h1>
      <p className="usa-paragraph">
        Create and manage email subscriptions to GCN Circulars and Notices here.
      </p>
      <Grid row>
        <Grid tablet={{ col: 'fill' }}>
          <h2>Circulars</h2>
        </Grid>
        <Grid tablet={{ col: 'auto' }}>
          <CircularsSubscriptionForm value={userIsSubscribedToCircularEmails} />
        </Grid>
      </Grid>
      <p className="usa-paragraph">
        {userIsSubscribedToCircularEmails
          ? 'You are currently subscribed to receive GCN Circulars via Email.'
          : 'You are not currently subscribed to receive GCN Circulars via Email.'}
      </p>

      <p className="usa-paragraph">
        <strong>Circulars</strong> are sent from GCN Circulars{' '}
        {`<no-reply@${hostname}>`} and are delivered to the email associated
        with your account ({email}).
      </p>
      <HeadingWithAddButton headingLevel={2}>Notices</HeadingWithAddButton>
      <p className="usa-paragraph">
        You can create as many <strong>Notice</strong> subscription alerts as
        you like. To create a new alert, click the "Add" button. Once you have
        created an alert, you can click the "Test Message" button to send a test
        email to the listed recipient, to verify that the emails will make it
        into your inbox.
      </p>
      <p className="usa-paragraph">
        Note that your preferenes here do not affect prior subscriptions on the
        old web site,{' '}
        <a rel="external" href="https://gcn.gsfc.nasa.gov/">
          https://gcn.gsfc.nasa.gov/
        </a>
        . To change your GCN Classic Notice subscriptions, please{' '}
        <Link to="/contact?service=gcn-classic">send us a message</Link>.
      </p>
      {data.length > 0 && (
        <SegmentedCards>
          {data.map((alert) => (
            <EmailNotificationCard key={alert.uuid} {...alert} />
          ))}
        </SegmentedCards>
      )}
    </>
  )
}
