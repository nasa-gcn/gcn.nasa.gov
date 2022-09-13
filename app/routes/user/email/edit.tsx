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
import { Button, ButtonGroup, Label, TextInput } from '@trussworks/react-uswds'
import { useState } from 'react'
import { NoticeFormat } from '~/components/NoticeFormat'
import { NoticeTypeCheckboxes } from '~/components/NoticeTypeCheckboxes'
import { formatAndNoticeTypeToTopic } from '~/lib/utils'
import { getUser } from '~/routes/__auth/user.server'
import type {
  EmailNotification,
  EmailNotificationVM,
} from '../email_notifications.server'
import { EmailNotificationsServer } from '../email_notifications.server'

export async function action({ request }: DataFunctionArgs) {
  const [data] = await Promise.all([request.formData()])
  const { uuid, intent, name, recipient, noticeFormat, ...rest } =
    Object.fromEntries(data)

  const machine = await EmailNotificationsServer.create(request)
  const noticeTypes = Object.keys(rest)
  const topics = noticeTypes.map((noticeType) =>
    formatAndNoticeTypeToTopic(noticeFormat.toString(), noticeType)
  )
  const emailNotification: EmailNotification = {
    name: name.toString(),
    recipient: recipient.toString(),
    created: 0,
    topics: topics,
    uuid: uuid?.toString(),
  }
  switch (intent) {
    case 'create':
      await machine.createEmailNotification(emailNotification)
      return redirect('/user/email')
    case 'update':
      await machine.updateEmailNotification(emailNotification)
      return redirect('/user/email')
    case 'delete':
      return null
    default:
      throw new Response('unknown intent', { status: 400 })
  }
}

export async function loader({ request }: DataFunctionArgs) {
  const { uuid } = Object.fromEntries(new URL(request.url).searchParams)
  let intent = 'create'
  const user = await getUser(request)
  const email = user?.email

  let notification: EmailNotificationVM = {
    format: 'text',
    noticeTypes: [],
    name: '',
    recipient: email ?? '',
    created: 0,
    topics: [],
  }
  if (uuid != undefined) {
    const machine = await EmailNotificationsServer.create(request)
    notification = await machine.getEmailNotification(uuid)
    intent = 'update'
  }
  const format = notification.format as 'text' | 'voevent' | 'binary'
  return { notification, intent, format }
}

export default function Edit() {
  const { notification, intent, format } = useLoaderData<typeof loader>()
  const defaultNameValid = !!notification.name
  const [nameValid, setNameValid] = useState(defaultNameValid)
  const defaultRecipientValid = !!notification.recipient
  const [recipientValid, setrecipientValid] = useState(defaultRecipientValid)
  const [alertsValid, setAlertsValid] = useState(false)

  return (
    <div className="tablet:grid-col-12">
      <Label htmlFor="type">Select Type of Email listener</Label>
      <Form method="post">
        <input type="hidden" name="uuid" value={notification.uuid} />
        <input type="hidden" name="intent" value={intent} />
        <Label htmlFor="name">
          Name
          <abbr title="required" className="usa-label--required">
            *
          </abbr>
        </Label>
        <TextInput
          id="name"
          name="name"
          type="text"
          inputSize="small"
          autoCapitalize="off"
          autoCorrect="off"
          defaultValue={notification.name}
          required={true}
          onChange={(e) => setNameValid(!!e.target.value)}
        />
        <Label htmlFor="recipient">
          Recipient
          <abbr title="required" className="usa-label--required">
            *
          </abbr>
        </Label>
        <TextInput
          id="recipient"
          name="recipient"
          type="email"
          autoCapitalize="off"
          autoCorrect="off"
          required={true}
          placeholder="email"
          defaultValue={notification.recipient}
          onChange={(e) => setrecipientValid(!!e.target.value)}
        />
        <Label htmlFor="format">Format</Label>
        <NoticeFormat name="noticeFormat" value={format} />
        <Label htmlFor="noticeTypes">Types</Label>
        <NoticeTypeCheckboxes
          defaultSelected={notification.noticeTypes}
          validationFunction={setAlertsValid}
        ></NoticeTypeCheckboxes>
        <ButtonGroup>
          <Link
            to=".."
            type="button"
            className="usa-button usa-button--outline"
          >
            Cancel
          </Link>
          <Button
            disabled={!(nameValid && recipientValid && alertsValid)}
            type="submit"
          >
            Save
          </Button>
        </ButtonGroup>
      </Form>
      {/* <Radio
        id="notice-radio"
        name="type"
        label="GCN Notices"
        defaultChecked
        onClick={() => setFormView('notice')}
      />
      <Radio
        id="circular-radio"
        name="type"
        label="Circulars"
        onClick={() => setFormView('circular')}
      />
      {formView == 'notice' ? (
        
      ) : (
        
      )} */}
    </div>
  )
}
