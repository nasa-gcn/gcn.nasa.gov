/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Icon,
  InputGroup,
  InputPrefix,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import { useState } from 'react'

import { getUser } from './_gcn._auth/user.server'
import { moderatorGroup } from './_gcn.circulars/circulars.server'
import { sendNewsAnnouncementEmail } from './_gcn.user.email/email_notices.server'
import Spinner from '~/components/Spinner'
import { getFormDataString } from '~/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const data = await request.formData()
  const subject = getFormDataString(data, 'subject')
  const body = getFormDataString(data, 'body')
  if (!subject || !body)
    throw new Response('subject and body are required', { status: 400 })
  await sendNewsAnnouncementEmail(subject, body, user)
  return null
}

export default function () {
  const [subjectValid, setSubjectValid] = useState(false)
  const [bodyValid, setBodyValid] = useState(false)
  const valid = subjectValid && bodyValid
  const fetcher = useFetcher()
  return (
    <>
      <h1>GCN News Announcement</h1>
      <fetcher.Form method="POST">
        <InputGroup
          className={classnames('maxw-full', {
            'usa-input--error': subjectValid === false,
            'usa-input--success': subjectValid,
          })}
        >
          <InputPrefix className="wide-input-prefix">Subject</InputPrefix>
          <TextInput
            autoFocus
            className="maxw-full"
            name="subject"
            id="subject"
            type="text"
            required={true}
            onChange={({ target: { value } }) => {
              setSubjectValid(Boolean(value))
            }}
          />
        </InputGroup>
        <label hidden htmlFor="body">
          Body
        </label>
        <Textarea
          name="body"
          id="body"
          required={true}
          className={classnames('maxw-full', {
            'usa-input--success': bodyValid,
          })}
          onChange={({ target: { value } }) => {
            setBodyValid(Boolean(value))
          }}
        />
        <ButtonGroup>
          <Link to={`/news`} className="usa-button usa-button--outline">
            Back
          </Link>
          <Button
            disabled={fetcher.state !== 'idle' || !valid}
            type="submit"
            value="save"
          >
            Send
          </Button>
          {fetcher.state !== 'idle' && (
            <div className="padding-top-1 padding-bottom-1">
              <Spinner /> Sending...
            </div>
          )}
          {fetcher.state === 'idle' && fetcher.data !== undefined && (
            <span className="text-middle">
              <Icon.Check role="presentation" color="green" /> Sent
            </span>
          )}
        </ButtonGroup>
      </fetcher.Form>
    </>
  )
}
