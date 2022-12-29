/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider'
import type { DataFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { Button, Icon, Label, TextInput } from '@trussworks/react-uswds'
import { useState } from 'react'
import Hint from '~/components/Hint'
import Spinner from '~/components/Spinner'
import { getFormDataString } from '~/lib/utils'
import { storage } from '../__auth/auth.server'
import { getUser, updateSession } from '../__auth/user.server'
import { client, maybeThrow } from './cognito.server'

export const handle = { breadcrumb: 'Profile', getSitemapEntries: () => null }

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  
  const { email, idp, name, affiliation } = user
  return { email, idp, name, affiliation }
}

export async function action({ request }: DataFunctionArgs) {
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

  try {
    await client.send(command)
  } catch (e) {
    maybeThrow(e, 'not saving name and affiliation permanently')
  }

  user.name = name
  user.affiliation = affiliation
  await updateSession({ user }, session)
  return null
}

function formatAuthor({
  name,
  affiliation,
  email,
}: {
  name?: string
  affiliation?: string
  email: string
}) {
  if (!name) return email
  else if (!affiliation) return `${name} <${email}>`
  else return `${name} at ${affiliation} <${email}>`
}

export default function User() {
  const { email, idp, name, affiliation } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const [dirty, setDirty] = useState(false)
  const [currentName, setCurrentName] = useState(name)
  const [currentAffiliation, setCurrentAffiliation] = useState(affiliation)
  const disabled = fetcher.state !== 'idle'

  return (
    <>
      <h1>Welcome, {email}!</h1>
      <p>You signed in with {idp || 'username and password'}.</p>
      <h2>Profile</h2>
      <fetcher.Form method="post" onSubmit={() => setDirty(false)}>
        <p>
          Your profile affects how your name appears in GCN Circulars that you
          submit.
        </p>
        <Label htmlFor="name">Name</Label>
        <Hint id="nameHint">
          How would you like your name to appear in GCN Circulars? For example:
          A. E. Einstein, A. Einstein, Albert Einstein
        </Hint>
        <TextInput
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
          This is how the "From" field will be showin in GCN Circulars that you
          submit.
        </Hint>
        <div aria-describedby="previewHint" id="preview">
          {formatAuthor({
            name: currentName,
            affiliation: currentAffiliation,
            email,
          })}
        </div>
        <Button
          className="usa-button margin-top-2"
          type="submit"
          disabled={disabled}
        >
          Save
        </Button>
        {fetcher.state !== 'idle' && (
          <>
            <Spinner /> Saving...
          </>
        )}
        {fetcher.type === 'done' && !dirty && (
          <>
            <Icon.Check color="green" /> Saved
          </>
        )}
      </fetcher.Form>
    </>
  )
}
