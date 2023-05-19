/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  GridContainer,
  Label,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import { validate } from 'email-validator'
import { useState } from 'react'

import { ReCAPTCHA, verifyRecaptcha } from '~/components/ReCAPTCHA'
import { sendEmail } from '~/lib/email.server'
import { getFormDataString } from '~/lib/utils'
import { useEmail, useRecaptchaSiteKey } from '~/root'

export const handle = {
  breadcrumb: 'Contact Us',
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()

  const recaptchaResponse = getFormDataString(data, 'g-recaptcha-response')
  await verifyRecaptcha(recaptchaResponse)

  const [email, subject, body] = ['email', 'subject', 'body'].map((key) => {
    const result = getFormDataString(data, key)
    if (!result) throw new Response(`${key} is undefined`, { status: 400 })
    return result
  })

  const to = ['gcnkafka@lists.nasa.gov']
  await sendEmail({
    body,
    subject,
    to,
    fromName: 'GCN Support',
    replyTo: [email, ...to],
  })

  return { email, subject }
}

export default function () {
  const defaultEmail = useEmail()
  const [emailValid, setEmailValid] = useState(!!defaultEmail)
  const [subjectValid, setSubjectValid] = useState(false)
  const [bodyValid, setBodyValid] = useState(false)
  const [recaptchaValid, setRecaptchaValid] = useState(!useRecaptchaSiteKey())
  const submitted = useActionData<typeof action>()

  return (
    <GridContainer className="usa-section">
      <h1>Contact Us</h1>
      {submitted ? (
        <>
          <p className="usa-intro">We got your message!</p>
          <p className="usa-paragraph">
            We received your message with subject "{submitted.subject}".
            Shortly, a GCN team member will contact you at the email address
            that you provided ({submitted.email}).
          </p>
          <ButtonGroup>
            <Link to="/contact" className="usa-button">
              Contact us again about something else
            </Link>
            <Link to="/" className="usa-button usa-button--outline">
              Go home
            </Link>
          </ButtonGroup>
        </>
      ) : (
        <Form method="POST">
          <p className="usa-paragraph">
            Have you checked if your question is answered in our{' '}
            <Link to="/docs/faq">Frequently Asked Questions (FAQ)</Link>?
          </p>
          <Label htmlFor="email">What is your email address?</Label>
          <TextInput
            id="email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            onChange={({ target: { value } }) => {
              setEmailValid(validate(value))
            }}
          />
          <Label htmlFor="subject">What is your question about?</Label>
          <TextInput
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="Subject"
            onChange={({ target: { value } }) => {
              setSubjectValid(!!value)
            }}
          />
          <Label htmlFor="email">What is your question?</Label>
          <Textarea
            id="body"
            name="body"
            required
            placeholder="Body"
            onChange={({ target: { value } }) => {
              setBodyValid(!!value)
            }}
          />
          <ReCAPTCHA
            onChange={(value) => {
              setRecaptchaValid(!!value)
            }}
          />
          <ButtonGroup>
            <Button
              disabled={
                !(recaptchaValid && emailValid && subjectValid && bodyValid)
              }
              type="submit"
            >
              Send
            </Button>
          </ButtonGroup>
        </Form>
      )}
    </GridContainer>
  )
}
