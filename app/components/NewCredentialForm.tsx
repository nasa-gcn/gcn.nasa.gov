/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Fieldset,
  FormGroup,
  Label,
  Radio,
  TextInput,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { ReCAPTCHA, verifyRecaptcha } from './ReCAPTCHA'
import { feature } from '~/lib/env.server'
import { getFormDataString } from '~/lib/utils'
import { useFeature, useRecaptchaSiteKey } from '~/root'
import { getUser } from '~/routes/_auth/user.server'
import {
  ClientCredentialVendingMachine,
  createClientCredential,
} from '~/routes/user.credentials/client_credentials.server'

export async function loader(args: LoaderFunctionArgs) {
  return await handleCredentialLoader(args)
}

export async function handleCredentialActions(
  request: Request,
  redirectSource: string
) {
  const [data, machine] = await Promise.all([
    request.formData(),
    ClientCredentialVendingMachine.create(request),
  ])

  switch (getFormDataString(data, 'intent')) {
    case 'create':
      const name = getFormDataString(data, 'name')
      const scope = getFormDataString(data, 'scope')
      const teamId = getFormDataString(data, 'teamId')
      const recaptchaResponse = getFormDataString(data, 'g-recaptcha-response')
      await verifyRecaptcha(recaptchaResponse)
      const user = await getUser(request)
      if (!user) throw new Response(null, { status: 403 })
      if (!teamId || !name) throw new Response(null, { status: 400 })
      const { client_id } = feature('TEAMS')
        ? await createClientCredential(user.sub, teamId, name)
        : await machine.createClientCredential(name, scope)
      let redirectTarget = ''
      if (redirectSource == 'quickstart') {
        const params = new URL(request.url).searchParams
        params.set('clientId', client_id)
        redirectTarget = `/quickstart/alerts?${params.toString()}`
      } else if (redirectSource == 'user') {
        redirectTarget = '/user/credentials'
      }

      return redirect(redirectTarget)

    case 'delete':
      const clientId = getFormDataString(data, 'clientId')
      if (!clientId) {
        throw new Response('clientId not present', { status: 400 })
      }
      await machine.deleteClientCredential(clientId)
      return null

    default:
      throw new Response('unknown intent', { status: 400 })
  }
}
export async function handleCredentialLoader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  const machine = await ClientCredentialVendingMachine.create(request)
  const client_credentials = await machine.getClientCredentials()
  const groups = await machine.getGroupDescriptions()

  return {
    client_credentials,
    groups,
    kafkaPermissions: user?.kafkaPermissions,
  }
}

export function NewCredentialForm({
  autoFocus,
}: Pick<JSX.IntrinsicElements['button'], 'autoFocus'>) {
  const { groups, kafkaPermissions } = useLoaderData<typeof loader>()
  const [recaptchaValid, setRecaptchaValid] = useState(!useRecaptchaSiteKey())
  const [nameValid, setNameValid] = useState(false)

  return (
    <Form method="POST">
      <input type="hidden" name="intent" value="create" />
      <p className="usa-paragraph">
        Choose a name for your new client credential.
      </p>
      <p className="usa-paragraph text-base">
        The name should help you remember what you use the client credential
        for, or where you use it. Examples: “My Laptop”, “Lab Desktop”, “GRB
        Pipeline”.
      </p>
      <Label htmlFor="name">Name</Label>
      <TextInput
        autoFocus={autoFocus}
        name="name"
        id="name"
        type="text"
        placeholder="Name"
        onChange={(e) => setNameValid(Boolean(e.target.value))}
      />
      {useFeature('TEAMS') ? (
        <>
          <Label htmlFor="teamId">Team</Label>
          <Fieldset id="teamId">
            {kafkaPermissions?.map((item, index) => (
              <Radio
                name="teamId"
                id={item.teamId}
                key={item.teamId}
                value={item.teamId}
                defaultChecked={index === 0}
                label={item.teamName}
                labelDescription={`${item.description} - Permission: ${item.permission}`}
              />
            ))}
          </Fieldset>
        </>
      ) : (
        <>
          <Label htmlFor="scope">Scope</Label>
          <Fieldset id="scope">
            {groups.map(([key, description], index) => (
              <Radio
                name="scope"
                id={key}
                key={key}
                value={key}
                defaultChecked={index === 0}
                label={key}
                labelDescription={description}
              />
            ))}
          </Fieldset>
        </>
      )}
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
            Back
          </Link>
          <Button disabled={!(nameValid && recaptchaValid)} type="submit">
            Create New Credentials
          </Button>
        </ButtonGroup>
      </FormGroup>
    </Form>
  )
}
