/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import {
  Button,
  FormGroup,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { storage } from './_auth/auth.server'
import { getUser, updateSession } from './_auth/user.server'
import { formatAuthor } from './circulars/circulars.lib'
import Hint from '~/components/Hint'
import Spinner from '~/components/Spinner'
import { cognito, maybeThrowCognito } from '~/lib/cognito.server'
import { updateUser } from '~/lib/user.server'
import { getFormDataString } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Profile',
  noIndex: true,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })

  const { email, idp, name, affiliation } = user
  return { email, idp, name, affiliation }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })

  const [session, data] = await Promise.all([
    storage.getSession(request.headers.get('Cookie')),
    request.formData(),
  ])
  const name = getFormDataString(data, 'name')
  const affiliation = getFormDataString(data, 'affiliation')

  const command = new UpdateUserAttributesCommand({
    UserAttributes: [
      {
        Name: 'name',
        Value: name,
      },
      {
        Name: 'custom:affiliation',
        Value: affiliation,
      },
    ],
    AccessToken: session.get('accessToken'),
  })

  await updateUser({
    sub: user.sub,
    email: user.email,
    username: name,
    affiliation,
  })

  try {
    await cognito.send(command)
  } catch (e) {
    maybeThrowCognito(e, 'not saving name and affiliation permanently')
  }

  user.name = name
  user.affiliation = affiliation
  await updateSession({ user }, session)
  return null
}

export default function () {
  const { email, idp, name, affiliation } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const [dirty, setDirty] = useState(false)
  const [currentName, setCurrentName] = useState(name)
  const [currentAffiliation, setCurrentAffiliation] = useState(affiliation)
  const disabled = fetcher.state !== 'idle'

  return (
    <>
      <h1>Welcome, {email}!</h1>
      <p className="usa-paragraph">
        You signed in with {idp || 'username and password'}.
      </p>
      <h2>Profile</h2>
      <fetcher.Form method="POST" onSubmit={() => setDirty(false)}>
        <p className="usa-paragraph">
          Your profile affects how your name appears in GCN Circulars that you
          submit.
        </p>
        <Label htmlFor="name">Name</Label>
        <Hint id="nameHint">
          How would you like your name to appear in GCN Circulars? For example:
          A. E. Einstein, A. Einstein, Albert Einstein
        </Hint>
        <TextInput
          autoFocus
          aria-describedby="nameHint"
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          disabled={disabled}
          onChange={(e) => {
            setDirty(true)
            setCurrentName(e.target.value)
          }}
        />
        <Label htmlFor="affiliation">Affiliation</Label>
        <Hint id="affiliationHint">
          For example: Pennsylvania State University, Ioffe Institute, DESY,
          Fermi-GBM Team, or AAVSO
        </Hint>
        <TextInput
          aria-describedby="affiliationHint"
          id="affiliation"
          name="affiliation"
          type="text"
          defaultValue={affiliation}
          disabled={disabled}
          onChange={(e) => {
            setDirty(true)
            setCurrentAffiliation(e.target.value)
          }}
        />
        <Label htmlFor="preview">Preview</Label>
        <Hint id="previewHint">
          This is how the "From" field will be shown in GCN Circulars that you
          submit.
        </Hint>
        <p aria-describedby="previewHint" id="preview" className="margin-top-0">
          {formatAuthor({
            name: currentName,
            affiliation: currentAffiliation,
            email,
          })}
        </p>
        <FormGroup>
          <Button className="usa-button" type="submit" disabled={disabled}>
            Save
          </Button>
          {fetcher.state !== 'idle' && (
            <span className="text-middle">
              <Spinner /> Saving...
            </span>
          )}
          {fetcher.state === 'idle' && fetcher.data !== undefined && !dirty && (
            <span className="text-middle">
              <Icon.Check role="presentation" color="green" /> Saved
            </span>
          )}
        </FormGroup>
      </fetcher.Form>
    </>
  )
}
