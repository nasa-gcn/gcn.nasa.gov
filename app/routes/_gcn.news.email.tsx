/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  FormGroup,
  InputGroup,
  InputPrefix,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import { useState } from 'react'
import { dedent } from 'ts-dedent'

import { getUser } from './_gcn._auth/user.server'
import { moderatorGroup } from './_gcn.circulars/circulars.server'
import { sendAnnouncementEmail } from './_gcn.user.email/email_announcements.server'
import { getFormDataString } from '~/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  const data = await request.formData()
  const subject = getFormDataString(data, 'subject')
  const body = getFormDataString(data, 'body')
  if (!subject || !body)
    throw new Response('subject and body are required', { status: 400 })
  await sendAnnouncementEmail(subject, body, user)
  return { subject }
}

export default function () {
  const [subjectValid, setSubjectValid] = useState(false)
  const [bodyValid, setBodyValid] = useState(false)
  const valid = subjectValid && bodyValid
  const submitted = useActionData<typeof action>()
  const defaultBody = dedent`The GCN Team is pleased to announce a new feature on https://gcn.nasa.gov that ...`
  return (
    <>
      <h1>GCN News Announcement</h1>
      {submitted ? (
        <>
          <p className="usa-intro">Your announcement has been sent!</p>
          <p className="usa-paragraph">
            Your announcement "{submitted.subject}" is being distributed.
          </p>
          <FormGroup>
            <ButtonGroup>
              <Link to="/news" className="usa-button">
                Return to News page
              </Link>
              <Link to="/" className="usa-button usa-button--outline">
                Go home
              </Link>
            </ButtonGroup>
          </FormGroup>
        </>
      ) : (
        <Form method="POST">
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
            defaultValue={defaultBody}
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
            <Button disabled={!valid} type="submit" value="save">
              Send
            </Button>
          </ButtonGroup>
        </Form>
      )}
    </>
  )
}
