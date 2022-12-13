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
  return {
    email: user.email,
    idp: user.idp,
    name: user.name,
    affiliation: user.affiliation,
  }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const name = getFormDataString(data, 'name')
  const affiliation = getFormDataString(data, 'affiliation')
  const server = await UserDataServer.create(request)
  await server.updateUserData(name, affiliation)

  return redirect('/user')
}

export default function User() {
  const { email, idp, name, affiliation } = useLoaderData<typeof loader>()
  return (
    <>
      <h1>Welcome, {email}!</h1>
      <p>You signed in with {idp || 'username and password'}.</p>
      <h2>Profile Info</h2>
      <Form method="post">
        <p>
          These fields will be displayed as the Submitter for any GCN Circulars
          you submit. They will follow the format of "&lt;Display Name&gt; at
          &lt;Affiliation&gt; &lt;Email&gt;".
        </p>
        <p>
          For example, "A. E. Einstein at Pennsylvania State University
          example@example.com"
        </p>
        <Label htmlFor="Name">Name</Label>
        <small className="text-base">
          How would you like your name to appear in GCN Circulars? For example:
          A. E. Einstein, A. Einstein, Albert Einstein
        </small>
        <TextInput id="name" name="name" type="text" defaultValue={name} />
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
        />
        <Button className="usa-button margin-top-2" type="submit">
          Update
        </Button>
      </Form>
    </>
  )
}
