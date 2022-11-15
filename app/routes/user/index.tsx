/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Button, Label, TextInput } from '@trussworks/react-uswds'
import { getFormDataString } from '~/lib/utils'
import { getUser } from '../__auth/user.server'
import { UserDataServer } from './user_data.server'

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const server = await UserDataServer.create(request)
  const addlUserData = await server.getUserData()
  return {
    email: user.email,
    idp: user.idp,
    displayName: addlUserData?.displayName,
    affiliation: addlUserData?.affiliation,
  }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const displayName = getFormDataString(data, 'displayName')
  const affiliation = getFormDataString(data, 'affiliation')

  if (!displayName) throw new Response('displayName not set', { status: 400 })
  if (!affiliation) throw new Response('affiliation not set', { status: 400 })

  const server = await UserDataServer.create(request)
  await server.updateUserData(displayName, affiliation)

  return redirect('/user')
}

export default function User() {
  const { email, idp, displayName, affiliation } =
    useLoaderData<typeof loader>()
  return (
    <>
      <h1>Welcome, {email}!</h1>
      <p>You signed in with {idp || 'username and password'}.</p>
      <h2>Profile Info</h2>
      <Form method="post">
        <Label htmlFor="displayName">Display Name</Label>
        <small className="text-base">
          How would you like your name to appear in GCN Circulars? For example:
          A. E. Einstein, A. Einstein, Albert Einstein
        </small>
        <TextInput
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={displayName}
          required
        />
        <Label htmlFor="affiliation">Affiliation</Label>
        <small className="text-base">
          For example: Pennsylvania State University, Ioffe Institute, DESY,
          Fermi-GBM Team, or AAVSO
        </small>
        <TextInput
          id="affiliation"
          name="affiliation"
          type="text"
          defaultValue={affiliation}
          required
        />
        <Button className="usa-button margin-top-2" type="submit">
          Update
        </Button>
      </Form>
    </>
  )
}
