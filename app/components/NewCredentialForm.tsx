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
import crypto from 'crypto'
import { useState } from 'react'

import { ReCAPTCHA, verifyRecaptcha } from './ReCAPTCHA'
import { feature } from '~/lib/env.server'
import { getFormDataString } from '~/lib/utils'
import { useFeature, useRecaptchaSiteKey } from '~/root'
import { scopedLogin } from '~/routes/_auth.login'
import { getScopedOpenIDClient, storage } from '~/routes/_auth/auth.server'
import {
  deleteToken,
  getUser,
  loadTokens,
  saveToken,
} from '~/routes/_auth/user.server'
import { ClientCredentialVendingMachine } from '~/routes/user.credentials/client_credentials.server'

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
      const recaptchaResponse = getFormDataString(data, 'g-recaptcha-response')
      await verifyRecaptcha(recaptchaResponse)

      // Token methods:
      if (feature('TOKEN_AUTH')) {
        const user = await getUser(request)
        if (!user) throw new Response(null, { status: 403 })
        if (!(name && scope)) throw new Response(null, { status: 400 })
        const { authUrl, cookie } = await scopedLogin(request, scope, name)
        return redirect(authUrl, { headers: { 'Set-Cookie': cookie, scope } })
      }
      // Old methods
      else {
        const { client_id } = await machine.createClientCredential(name, scope)
        let redirectTarget = ''
        if (redirectSource == 'quickstart') {
          const params = new URL(request.url).searchParams
          params.set('clientId', client_id)
          redirectTarget = `/quickstart/alerts?${params.toString()}`
        } else if (redirectSource == 'user') {
          redirectTarget = '/user/credentials'
        }
        return redirect(redirectTarget)
      }
    case 'delete-token':
      const user = await getUser(request)
      const uuid = getFormDataString(data, 'uuid')
      if (!user || !uuid) throw new Response(null, { status: 403 })
      await deleteToken(user.sub, uuid)
      return null
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
  if (!user) throw new Response(null, { status: 403 })
  const tokens = await loadTokens(user.sub)
  const parsedUrl = new URL(request.url)

  if (parsedUrl.searchParams.get('code')) {
    const { scopedToken, scope } = await tokenCreationCallback(
      request,
      parsedUrl,
      user.sub
    )
    return redirect(
      `/quickstart/alerts?tokenId=${encodeURIComponent(scopedToken.uuid)}&scope=${encodeURIComponent(scope)}`
    )
  }
  const machine = await ClientCredentialVendingMachine.create(request)
  const client_credentials = await machine.getClientCredentials()
  const groups = await machine.getGroupDescriptions()
  return { client_credentials, groups, tokens }
}

export async function tokenCreationCallback(
  request: Request,
  parsedUrl: URL,
  sub: string
) {
  const cookie = request.headers.get('Cookie')
  const oidcSession = await storage.getSession(cookie)
  const currentToken = oidcSession.get('tokenName')
  const { code_verifier, state, scope } =
    oidcSession.get('tokenSets')[currentToken]
  const client = await getScopedOpenIDClient()
  const params = client.callbackParams(parsedUrl.search)
  parsedUrl.search = ''

  const tokenSet = await client.oauthCallback(parsedUrl.toString(), params, {
    code_verifier,
    state,
    scope,
  })
  if (!tokenSet.refresh_token) throw new Response(null, { status: 500 })
  const scopedToken = {
    sub,
    scope,
    token: tokenSet.refresh_token,
    name: currentToken,
    createdOn: Date.now(),
    uuid: crypto.randomUUID(),
  }

  await saveToken(scopedToken)
  return { scopedToken, scope }
}

export function NewCredentialForm({
  autoFocus,
}: Pick<JSX.IntrinsicElements['button'], 'autoFocus'>) {
  const { groups } = useLoaderData<typeof loader>()
  const [recaptchaValid, setRecaptchaValid] = useState(!useRecaptchaSiteKey())
  const [nameValid, setNameValid] = useState(false)

  const tokenAuth = useFeature('TOKEN_AUTH')

  return (
    <Form method="POST">
      <input type="hidden" name="intent" value="create" />
      <p className="usa-paragraph">
        Choose a name for your new{' '}
        {tokenAuth ? 'refresh token' : 'client credential'}.
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
            Create New {tokenAuth ? 'Token' : 'Credentials'}
          </Button>
        </ButtonGroup>
      </FormGroup>
    </Form>
  )
}
