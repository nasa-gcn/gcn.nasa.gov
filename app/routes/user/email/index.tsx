/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Grid, Icon } from '@trussworks/react-uswds'
import { useState } from 'react'

import {
  createCircularEmailNotification,
  deleteCircularEmailNotification,
  getUsersCircularSubmissionStatus,
} from '../email_circulars.server'
import {
  deleteEmailNotification,
  getEmailNotifications,
  sendTestEmail,
} from '../email_notices.server'
import EmailNotificationCard from '~/components/EmailNotificationCard'
import HeadingWithAddButton from '~/components/HeadingWithAddButton'
import SegmentedCards from '~/components/SegmentedCards'
import Spinner from '~/components/Spinner'
import { feature, getHostname } from '~/lib/env.server'
import { getFormDataString } from '~/lib/utils'
import { useFeature } from '~/root'
import { getUser } from '~/routes/__auth/user.server'

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
    case 'sendTest':
      const recipient = getFormDataString(data, 'recipient')
      if (recipient) {
        await sendTestEmail(recipient)
      }
    case 'subscribe':
      if (!feature('circulars')) break
      await createCircularEmailNotification(user.sub, user.email)
      break
    case 'unsubscribe':
      if (!feature('circulars')) break
      await deleteCircularEmailNotification(user.sub, user.email)
      break
  }
  return redirect('/user/email')
}

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const data = await getEmailNotifications(user.sub)
  const hostname = getHostname()
  const userIsSubscribedToCircularEmails =
    await getUsersCircularSubmissionStatus(user.sub)

  return { data, userIsSubscribedToCircularEmails, hostname, email: user.email }
}

export default function () {
  const { data, userIsSubscribedToCircularEmails, hostname, email } =
    useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const [dirty, setDirty] = useState(false)
  const enableCirculars = useFeature('circulars')

  return (
    <>
      <h1>Email Notifications</h1>
      <p className="usa-paragraph">
        Create and manage email subscriptions to GCN{' '}
        {enableCirculars && 'Circulars and'} Notices here.
      </p>
      <p className="usa-paragraph">
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
      {enableCirculars && (
        <>
          <h2>Circulars</h2>
          <p>
            Subscriptions to <strong>Circulars</strong> are sent from GCN
            Circulars {`<no-reply@${hostname}>`} and are delivered to the email
            associated with your account ({email}).
          </p>
          <fetcher.Form method="post" onSubmit={() => setDirty(false)}>
            <input
              type="hidden"
              name="intent"
              value={
                userIsSubscribedToCircularEmails ? 'unsubscribe' : 'subscribe'
              }
            />
            <p>
              {userIsSubscribedToCircularEmails
                ? 'You are currently subscribed to receive GCN Circulars via Email.'
                : 'You are not currently subscribed to receive GCN Circulars via Email.'}
            </p>
            <Grid row className="flex-align-center">
              <ButtonGroup type="segmented" className="flex-auto">
                <Button
                  type="submit"
                  outline={!userIsSubscribedToCircularEmails}
                >
                  On
                </Button>
                <Button
                  type="submit"
                  outline={userIsSubscribedToCircularEmails}
                >
                  Off
                </Button>
              </ButtonGroup>
              <div className="padding-1 flex-auto">
                {fetcher.state !== 'idle' && (
                  <>
                    <Spinner /> Saving...
                  </>
                )}
                {fetcher.type === 'done' && !dirty && (
                  <>
                    <Icon.Check color="green" /> Saved
                  </>
                )}
              </div>
            </Grid>
          </fetcher.Form>
        </>
      )}
      <HeadingWithAddButton headingLevel={2}>Notices</HeadingWithAddButton>
      <p>
        You can create as many <strong>Notice</strong> subscription alerts as
        you like. To create a new alert, click the "Add" button. Once you have
        created an alert, you can click the "Test Message" button to send a test
        email to the listed recipient, to verify that the emails will make it
        into your inbox.
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
