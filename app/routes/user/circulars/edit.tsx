/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import CircularsEditForm from '~/components/CircularsEditForm'
import { getFormDataString } from '~/lib/utils'
import type { CircularModel } from '~/routes/api/circulars.server'
import { CircularsServer } from '~/routes/api/circulars.server'
import { getUser } from '~/routes/__auth/user.server'

export async function action({ request }: DataFunctionArgs) {
  // Save changes
  const data = await request.formData()
  if (dataIsValid(data)) {
    const machine = await CircularsServer.create(request)

    const circularModel: CircularModel = {
      id: getFormDataString(data, 'id'),
      subject: getFormDataString(data, 'subject') ?? '',
      body: getFormDataString(data, 'body') ?? '',
      linkedEvent: getFormDataString(data, 'linkedEvent'),
    }
    // The id field will be set as the correctedCircularId to keep a trail of any corrections
    await machine.createNewCircular(circularModel)
  }
  return redirect('/circulars')
}

export async function loader({ request }: DataFunctionArgs) {
  const { id, created } = Object.fromEntries(new URL(request.url).searchParams)
  const machine = await CircularsServer.create(request)
  const data = await machine.getCircularById(id, created)
  const user = await getUser(request)
  const email = user?.email
  return { email, data }
}

export default function Edit() {
  const { email, data } = useLoaderData<typeof loader>()
  return <>{email ? <CircularsEditForm {...data} /> : null}</>
}

function dataIsValid(data: FormData) {
  return (
    !!getFormDataString(data, 'body') && !!getFormDataString(data, 'subject')
  )
}
