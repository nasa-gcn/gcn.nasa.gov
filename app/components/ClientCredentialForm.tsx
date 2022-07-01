/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { useLoaderData } from '@remix-run/react'
import { Label, TextInput, Dropdown, Button } from '@trussworks/react-uswds'
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { getEnvOrDieInProduction } from '~/lib/env'

export async function loader() {
  const recaptchaSiteKey = getEnvOrDieInProduction('RECAPTCHA_SITE_KEY')
  return { recaptchaSiteKey }
}

export default function ClientCredentialForm({ ...props }) {
  const { recaptchaSiteKey } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>() ?? []
  const defaultName = ''
  const [name, setName] = useState(defaultName)
  const defaultScope = 'gcn.nasa.gov/kafka-public-consumer'
  const [scope, setScope] = useState(defaultScope)
  const [disableRequestButton, setDisableButton] = useState(false)

  function handleCreate() {
    let recaptchaResponse
    if (recaptchaSiteKey) {
      const recaptchaResponse = grecaptcha.getResponse()
      if (!recaptchaResponse) {
        // TODO: throw an error or something, for now return
        return
      }
    }
    fetch('/api/client_credentials', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, scope, recaptchaResponse }),
    })
      .then((result) => result.json())
      .then(() => {
        props.postClickHandler()
      })
  }
  function onChange(value: any) {
    setDisableButton(!value)
  }
  return (
    <div>
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
        onChange={(e) => setName(e.target.value)}
      />
      <Label htmlFor="scope">Scope</Label>
      <Dropdown
        id="scope"
        name="scope"
        defaultValue={defaultScope}
        onChange={(e) => setScope(e.target.value)}
        onBlur={(e) => setScope(e.target.value)}
      >
        <option value="gcn.nasa.gov/kafka-public-consumer">
          gcn.nasa.gov/kafka-public-consumer
        </option>
      </Dropdown>
      <br />
      {recaptchaSiteKey ? (
        <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={onChange}></ReCAPTCHA>
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
  )
}
