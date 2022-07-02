/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  Button,
  Dropdown,
  Grid,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { ClientCredentialVendingMachine } from '../client_credentials.server'
import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import moment from 'moment'
import type { ReactNode } from 'react'
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { getEnvOrDieInProduction } from '~/lib/env'

export async function loader({ request }: DataFunctionArgs) {
  const machine = await ClientCredentialVendingMachine.create(request)
  const client_credentials = await machine.getClientCredentials()
  const groups = machine.groups
  const recaptchaSiteKey = getEnvOrDieInProduction('RECAPTCHA_SITE_KEY')
  return { client_credentials, recaptchaSiteKey, groups }
}

async function verifyRecaptcha(response: string) {
  const secret = getEnvOrDieInProduction('RECAPTCHA_SITE_SECRET')
  if (!secret) return

  const params = new URLSearchParams()
  params.set('response', response)
  params.set('secret', secret)
  const verifyResponse = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    { method: 'POST', body: params }
  )
  const { success } = await verifyResponse.json()
  if (!success) throw new Response('ReCAPTCHA was invalid', { status: 400 })
}

export async function action({ request }: DataFunctionArgs) {
  const {
    name,
    scope,
    'g-recaptcha-response': recaptchaResponse,
  } = Object.fromEntries(await request.formData()) as { [k: string]: string }
  await verifyRecaptcha(recaptchaResponse)
  const machine = await ClientCredentialVendingMachine.create(request)
  const { client_id } = await machine.createClientCredential(name, scope)
  return redirect(
    `/user/streaming_steps/alerts?clientId=${encodeURIComponent(client_id)}`
  )
}

function SegmentedCard({ children }: { children: ReactNode[] }) {
  return (
    <>
      {children.map((child, index) => (
        <div
          key={index}
          className={`padding-2 border-base-lighter border-left-2px border-right-2px border-bottom-2px border-solid ${
            index == 0 ? 'radius-top-md' : ''
          } ${index == children.length - 1 ? 'radius-bottom-md' : ''} ${
            index > 0 ? 'border-top-0' : 'border-top-2px'
          }`}
        >
          {child}
        </div>
      ))}
    </>
  )
}

export function NewCredentialForm() {
  const { groups, recaptchaSiteKey } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>()
  const [recaptchaValid, setRecaptchaValid] = useState(!recaptchaSiteKey)
  const [nameValid, setNameValid] = useState(false)

  return (
    <Form method="post">
      <div className="usa-prose">
        <p>Choose a name for your new client credential.</p>
        <p className="text-base">
          The name should help you remember what you use the client credential
          for, or where you use it. Examples: “My Laptop”, “Lab Desktop”, “GRB
          Pipeline”.
        </p>
      </div>
      <Label htmlFor="name">Name</Label>
      <TextInput
        data-focus
        name="name"
        id="name"
        type="text"
        placeholder="Name"
        onChange={(e) => setNameValid(!!e.target.value)}
      />
      <Label htmlFor="scope">Scope</Label>
      <Dropdown
        id="scope"
        name="scope"
        defaultValue="gcn.nasa.gov/kafka-public-consumer"
      >
        {groups.map((group) => (
          <option value={group} key={group}>
            {group}
          </option>
        ))}
      </Dropdown>
      <p>
        {recaptchaSiteKey ? (
          <ReCAPTCHA
            sitekey={recaptchaSiteKey}
            onChange={(value) => {
              setRecaptchaValid(!!value)
            }}
          ></ReCAPTCHA>
        ) : (
          <div className="usa-prose">
            <p className="text-base">
              You are working in a development environment, the ReCaptcha is
              currently hidden
            </p>
          </div>
        )}
      </p>
      <Link to=".." type="button" className="usa-button usa-button--outline">
        Back
      </Link>
      <Button disabled={!(nameValid && recaptchaValid)} type="submit">
        Request New Credentials
      </Button>
    </Form>
  )
}

export default function Credentials() {
  const { client_credentials } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>()

  const explanation = (
    <>
      Client credentials allow your scripts to interact with GCN on your behalf.
    </>
  )

  return (
    <>
      {client_credentials.length > 0 ? (
        <>
          <p>
            {explanation} Select one of your existing client credentials, or
            create a new one.
          </p>
          <SegmentedCard>
            {client_credentials.map(({ name, client_id, created }) => (
              <Link
                className="text-no-underline text-ink"
                key={client_id}
                to={`../alerts?clientId=${encodeURIComponent(client_id)}`}
              >
                <Grid row>
                  <div className="grid-col flex-fill">
                    <div>
                      <strong>{name}</strong>{' '}
                      <small className="text-base">
                        (created {moment.utc(created).fromNow()})
                      </small>
                    </div>
                    <div>
                      <small>
                        client ID: <code>{client_id}</code>
                      </small>
                    </div>
                  </div>
                  <div className="grid-col flex-auto">
                    <Button type="button">Select</Button>
                  </div>
                </Grid>
              </Link>
            ))}
          </SegmentedCard>
          <div className="padding-2" key="new">
            <strong>New client credentials....</strong>
            <NewCredentialForm />
          </div>
        </>
      ) : (
        <>
          <p>{explanation}</p>
          <NewCredentialForm />
        </>
      )}
    </>
  )
}
