/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Alert,
  Button,
  Dropdown,
  Label,
  TextInput,
  ValidationChecklist,
  ValidationItem,
} from '@trussworks/react-uswds'
import type { DataFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import ReCAPTCHA from 'react-google-recaptcha'
import { ClientCredentialVendingMachine } from './client_credentials.server'
import Tabs from '~/components/Tabs'
import {
  GcnKafkaPythonSampleCode,
  GcnKafkaJsSampleCode,
} from '~/components/ClientSampleCode'
import { getEnvOrDieInProduction } from '~/lib/env'
import ClientCredential from '~/components/ClientCredentialCard'
import type { ClientCredentialData } from '~/components/ClientCredentialCard'

export async function loader({ request }: DataFunctionArgs) {
  const machine = await ClientCredentialVendingMachine.create(request)
  const client_credentials = await machine.getClientCredentials()
  const groups = machine.groups
  const recaptchaSiteKey = getEnvOrDieInProduction('RECAPTCHA_SITE_KEY')
  return { client_credentials, groups, recaptchaSiteKey }
}

export const meta: MetaFunction = () => ({
  title: 'GCN - Client Credentials',
})

interface Validator {
  [key: string]: any
}

interface CodeDemoTabsType {
  label: string
  Component: React.ReactNode
}

export default function Index() {
  const { client_credentials, groups, recaptchaSiteKey } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>()
  const [items, setItems] = useState<ClientCredentialData[]>(client_credentials)

  const defaultName = ''
  const [name, setName] = useState(defaultName)
  const defaultScope = 'gcn.nasa.gov/kafka-public-consumer'
  const [scope, setScope] = useState(defaultScope)
  const defaultDisableButton = !!recaptchaSiteKey
  const [disableRequestButton, setDisableButton] =
    useState(defaultDisableButton)
  const [validations, setValidations] = useState({ name: false })
  client_credentials.sort((a, b) => a.created - b.created)

  const validateInput = (event: ChangeEvent<HTMLInputElement>): void => {
    const {
      target: { value },
    } = event
    const updatedValidations: Validator = {}
    setName(value)
    Object.keys(validations).forEach((validator) => {
      updatedValidations[validator] = validate(validator, value)
    })

    setValidations({ ...validations, ...updatedValidations })
  }

  function getClientId(): string {
    return items.sort((a, b) => b.created - a.created)[0]?.client_id ?? '...'
  }

  function getClientSecret(): string {
    return (
      items.sort((a, b) => b.created - a.created)[0]?.client_secret ?? '...'
    )
  }

  function tabs(): CodeDemoTabsType[] {
    return [
      {
        label: 'Python',
        Component: GcnKafkaPythonSampleCode({
          clientId: getClientId(),
          clientSecret: getClientSecret(),
        }),
      },
      {
        label: 'Javscript',
        Component: GcnKafkaJsSampleCode({
          clientId: getClientId(),
          clientSecret: getClientSecret(),
        }),
      },
    ]
  }

  function validate(type: string, value: string): boolean {
    switch (type) {
      case 'name':
        return value != null && value != ''

      default:
        console.warn(`Undefined type validation for: "${type}"`)
        return false
    }
  }

  function handleDelete(client_id: string) {
    fetch(`/api/client_credentials/${client_id}`, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((result) => {
      if (result.ok) {
        setItems(items.filter((item) => item.client_id != client_id))
      } else {
        console.log(result)
      }
    })
  }

  function handleCreate() {
    if (!recaptchaSiteKey) return
    const recaptchaResponse = grecaptcha.getResponse()
    if (!recaptchaResponse) {
      // TODO: throw an error or something, for now return
      return
    }
    fetch('/api/client_credentials', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        scope,
        recaptchaResponse,
      }),
    })
      .then((result) => result.json())
      .then((item) => {
        setItems([item, ...items])
      })
  }

  function onChange(value: any) {
    setDisableButton(!value)
  }
  return (
    <>
      <h1>Client Credentials</h1>
      <div className="usa-prose">
        <p>
          A Client Credential is a randomly generated Client ID and Client
          Secret that you can use in script to connect to the GCN Kafka broker.
        </p>
      </div>
      {items.length > 0 ? (
        <>
          <h3>Existing Credentials</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {items.map((item) => (
              <ClientCredential
                {...item}
                key={item.client_id}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </>
      ) : null}
      <h3>Create New Client Credential</h3>
      <section>
        <div>
          <div className="usa-prose">
            <p id="modal-new-description">
              Choose a name for your new client credential.
            </p>
            <p className="text-base">
              The name should help you remember what you use the client
              credential for, or where you use it. Examples: “My Laptop”, “Lab
              Desktop”, “GRB Pipeline”.
            </p>
          </div>
          <Alert
            type="info"
            validation
            heading="Requirements"
            headingLevel="h4"
          >
            <ValidationChecklist id="validate-code">
              <ValidationItem id="name" isValid={validations.name}>
                The Name field is required
              </ValidationItem>
            </ValidationChecklist>
          </Alert>
          <Label htmlFor="name">Name</Label>
          <TextInput
            data-focus
            name="name"
            id="name"
            type="text"
            placeholder="Name"
            defaultValue={defaultName}
            onChange={validateInput}
          />
          <Label htmlFor="scope">Scope</Label>
          <Dropdown
            id="scope"
            name="scope"
            defaultValue={defaultScope}
            onChange={(e) => setScope(e.target.value)}
            onBlur={(e) => setScope(e.target.value)}
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Dropdown>
          <br />
          {recaptchaSiteKey ? (
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={onChange}
            ></ReCAPTCHA>
          ) : (
            <div className="usa-prose">
              <p className="text-base">
                You are working in a development environment, the ReCaptcha is
                currently hidden
              </p>
            </div>
          )}
          <br></br>
          <Button
            disabled={disableRequestButton}
            type="submit"
            onClick={handleCreate}
          >
            Request New Credentials
          </Button>
        </div>
      </section>
      <div>
        {items.some((item) => item.client_secret) ? (
          <div>
            <br />
            <Alert
              type="success"
              heading="Your new client credential was created."
            >
              Make sure that you copy the client secret. It will only be shown
              once.
            </Alert>
          </div>
        ) : null}
      </div>
      <h3>Code Samples</h3>
      <Tabs tabs={tabs()} />
    </>
  )
}
