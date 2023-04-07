/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Fieldset,
  Label,
  Radio,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import { validate } from 'email-validator'
import { useState } from 'react'

import { ReCAPTCHA, verifyRecaptcha } from '~/components/ReCAPTCHA'
import { sendEmail } from '~/lib/email.server'
import { getFormDataString } from '~/lib/utils'
import { useEmail, useRecaptchaSiteKey } from '~/root'

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()

  const recaptchaResponse = getFormDataString(data, 'g-recaptcha-response')
  await verifyRecaptcha(recaptchaResponse)

  const [email, service, subject, body] = [
    'email',
    'service',
    'subject',
    'body',
  ].map((key) => {
    const result = getFormDataString(data, key)
    if (!result) throw new Response(`${key} is undefined`, { status: 400 })
    return result
  })

  let recipient
  switch (service) {
    case 'gcn':
      recipient = 'gcnkafka@lists.nasa.gov'
      break
    case 'gcn-classic':
      recipient = 'gcn-classic@athena.gsfc.nasa.gov'
      break
    default:
      throw new Response('invalid service', { status: 400 })
  }

  await sendEmail({
    body,
    subject,
    recipient,
    fromName: 'GCN Support',
    replyTo: [email, recipient],
  })

  return { email, subject }
}

export default function () {
  const defaultEmail = useEmail()
  const [searchParams] = useSearchParams()
  let defaultService = searchParams.get('service')
  if (!(defaultService && ['gcn', 'gcn-classic'].includes(defaultService)))
    defaultService = 'gcn'

  const [emailValid, setEmailValid] = useState(!!defaultEmail)
  const [subjectValid, setSubjectValid] = useState(false)
  const [bodyValid, setBodyValid] = useState(false)
  const [recaptchaValid, setRecaptchaValid] = useState(!useRecaptchaSiteKey())
  const submitted = useActionData<typeof action>()

  return (
    <>
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
        <Form method="post">
          <Label htmlFor="service-fieldset">What do you need help with?</Label>
          <Fieldset name="service-fieldset">
            <Radio
              id="service-gcn"
              name="service"
              value="gcn"
              label="GCN"
              labelDescription="This web site, Kafka, sign-in issues, new GCN Notice types, Unified Schema"
              defaultChecked={defaultService === 'gcn'}
            />
            <Radio
              id="service-gcn-classic"
              name="service"
              value="gcn-classic"
              label="GCN Classic"
              labelDescription={
                <>
                  The legacy web site at{' '}
                  <Link to="https://gcn.gsfc.nasa.gov" rel="external">
                    https://gcn.gsfc.nasa.gov
                  </Link>
                  , legacy GCN Notice and Circular subscriptions, legacy GCN
                  Notice formats
                </>
              }
              defaultChecked={defaultService === 'gcn-classic'}
            />
          </Fieldset>
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
    </>
  )
}
