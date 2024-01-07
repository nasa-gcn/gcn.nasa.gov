/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  FormGroup,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import type {
  EmailNotification,
  EmailNotificationVM,
} from './_gcn.user.email/email_notices.server'
import {
  createEmailNotification,
  deleteEmailNotification,
  getEmailNotification,
  updateEmailNotification,
} from './_gcn.user.email/email_notices.server'
import { type NoticeFormat, NoticeFormatInput } from '~/components/NoticeFormat'
import { NoticeTypeCheckboxes } from '~/components/NoticeTypeCheckboxes/NoticeTypeCheckboxes'
import { ReCAPTCHA, verifyRecaptcha } from '~/components/ReCAPTCHA'
import { formatAndNoticeTypeToTopic } from '~/lib/utils'
import { useRecaptchaSiteKey } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'
import { getUser } from '~/routes/_gcn._auth/user.server'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Edit',
  getSitemapEntries: () => null,
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const data = await request.formData()
  const {
    uuid,
    intent,
    name,
    recipient,
    noticeFormat,
    'g-recaptcha-response': recaptchaResponse,
    ...rest
  } = Object.fromEntries(data)
  if (intent !== 'delete') await verifyRecaptcha(recaptchaResponse?.toString())
  const noticeTypes = Object.keys(rest)
  const topics = noticeTypes.map((noticeType) =>
    formatAndNoticeTypeToTopic(noticeFormat.toString(), noticeType)
  )
  const emailNotification: EmailNotification = {
    name: name.toString(),
    recipient: recipient.toString(),
    created: 0,
    topics,
    uuid: uuid?.toString(),
    sub: user.sub,
  }
  switch (intent) {
    case 'create':
      await createEmailNotification(emailNotification)
      return redirect('/user/email')
    case 'update':
      await updateEmailNotification(emailNotification)
      return redirect('/user/email')
    case 'delete':
      if (emailNotification.uuid) {
        await deleteEmailNotification(emailNotification.uuid, user.sub)
      }
      return redirect('/user/email')
    default:
      throw new Response('unknown intent', { status: 400 })
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { uuid } = Object.fromEntries(new URL(request.url).searchParams)
  let intent = 'create'
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const email = user?.email

  let notification: EmailNotificationVM = {
    format: 'text',
    noticeTypes: [],
    name: '',
    recipient: email ?? '',
    created: 0,
    topics: [],
    sub: user.sub,
  }
  if (uuid != undefined) {
    notification = await getEmailNotification(uuid, user.sub)
    intent = 'update'
  }
  const format = notification.format as NoticeFormat
  return { notification, intent, format }
}

export default function () {
  const { notification, format } = useLoaderData<typeof loader>()
  const defaultNameValid = Boolean(notification.name)
  const [nameValid, setNameValid] = useState(defaultNameValid)
  const defaultRecipientValid = Boolean(notification.recipient)
  const [recipientValid, setRecipientValid] = useState(defaultRecipientValid)
  const [alertsValid, setAlertsValid] = useState(false)
  const [recaptchaValid, setRecaptchaValid] = useState(!useRecaptchaSiteKey())

  return (
    <Form method="POST">
      <h1>Edit Email Notification</h1>
      <input type="hidden" name="uuid" value={notification.uuid} />
      <Label htmlFor="name">
        Name
        <span title="required" className="usa-label--required">
          *
        </span>
      </Label>
      <TextInput
        autoFocus
        id="name"
        name="name"
        type="text"
        inputSize="small"
        autoCapitalize="off"
        autoCorrect="off"
        defaultValue={notification.name}
        required={true}
        onChange={(e) => setNameValid(Boolean(e.target.value))}
      />
      <Label htmlFor="recipient">
        Recipient
        <span title="required" className="usa-label--required">
          *
        </span>
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
        onChange={(e) => setRecipientValid(Boolean(e.target.value))}
      />
      <Label htmlFor="format">Format</Label>
      <NoticeFormatInput name="noticeFormat" value={format} showJson={false} />
      <Label htmlFor="noticeTypes">Types</Label>
      <NoticeTypeCheckboxes
        defaultSelected={notification.noticeTypes}
        validationFunction={setAlertsValid}
      ></NoticeTypeCheckboxes>
      <ReCAPTCHA
        onChange={(value) => {
          setRecaptchaValid(Boolean(value))
        }}
      />

      <FormGroup>
        <ButtonGroup>
          <Link
            to=".."
            type="button"
            className="usa-button usa-button--outline"
          >
            Cancel
          </Link>
          {notification.uuid && (
            <Button
              name="intent"
              value="delete"
              type="submit"
              className="usa-button--secondary"
            >
              Delete
            </Button>
          )}
          <Button
            name="intent"
            value={notification.uuid ? 'update' : 'create'}
            disabled={
              !(nameValid && recipientValid && alertsValid && recaptchaValid)
            }
            type="submit"
          >
            {notification.uuid ? 'Update' : 'Save'}
          </Button>
        </ButtonGroup>
      </FormGroup>
    </Form>
  )
}
