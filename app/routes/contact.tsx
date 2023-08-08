/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs, HeadersFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  FormGroup,
  GridContainer,
  Label,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
// @ts-expect-error: no type definitions for addresscompiler
import { compile } from 'addresscompiler'
import { validate } from 'email-validator'
import { useState } from 'react'

import { ReCAPTCHA, verifyRecaptcha } from '~/components/ReCAPTCHA'
import { sendEmail } from '~/lib/email.server'
import { feature, getEnvOrDie, origin } from '~/lib/env.server'
import {
  getBasicAuthHeaders,
  getCanonicalUrlHeaders,
  pickHeaders,
} from '~/lib/headers.server'
import { getFormDataString } from '~/lib/utils'
import { useEmail, useName, useRecaptchaSiteKey } from '~/root'

export const handle = {
  breadcrumb: 'Contact Us',
}

export async function loader() {
  return json(null, {
    headers: getCanonicalUrlHeaders(new URL('/contact', origin)),
  })
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()

  const recaptchaResponse = getFormDataString(data, 'g-recaptcha-response')
  await verifyRecaptcha(recaptchaResponse)

  const [name, email, subject, body] = ['name', 'email', 'subject', 'body'].map(
    (key) => {
      const result = getFormDataString(data, key)
      if (!result) throw new Response(`${key} is undefined`, { status: 400 })
      return result
    }
  )

  if (feature('zendesk')) {
    const response = await fetch(
      'https://nasa-gcn.zendesk.com/api/v2/requests.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getBasicAuthHeaders(
            `${getEnvOrDie('ZENDESK_TOKEN_EMAIL')}/token`,
            getEnvOrDie('ZENDESK_TOKEN')
          ),
        },
        body: JSON.stringify({
          request: { requester: { name, email }, subject, comment: { body } },
        }),
      }
    )
    if (!response.ok) {
      console.error(response)
      throw new Error(`Reqeust failed with status ${response.status}`)
    }
  } else {
    const to = ['gcnkafka@lists.nasa.gov']
    await sendEmail({
      body,
      subject,
      to,
      fromName: 'GCN Support',
      replyTo: [compile({ name, address: email }), ...to],
    })
  }

  return { email, subject }
}

export default function () {
  const defaultName = useName()
  const defaultEmail = useEmail()
  const [nameValid, setNameValid] = useState(!!defaultName)
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
          <FormGroup>
            <ButtonGroup>
              <Link to="/contact" className="usa-button">
                Contact us again about something else
              </Link>
              <Link to="/" className="usa-button usa-button--outline">
                Go home
              </Link>
            </ButtonGroup>
          </FormGroup>
        </>
      ) : (
        <Form method="POST">
          <p className="usa-paragraph">
            Have you checked if your question is answered in our{' '}
            <Link to="/docs/faq">Frequently Asked Questions (FAQ)</Link>?
          </p>
          <Label htmlFor="name">What is your name?</Label>
          <TextInput
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaultName}
            onChange={({ target: { value } }) => {
              setNameValid(!!value)
            }}
          />
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
                !(
                  recaptchaValid &&
                  nameValid &&
                  emailValid &&
                  subjectValid &&
                  bodyValid
                )
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
