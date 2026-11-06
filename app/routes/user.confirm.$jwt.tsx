/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunctionArgs, redirect } from '@remix-run/node'

import { getUser } from './_auth/user.server'
import { decodeAddressConfirmation } from './unsubscribe.$jwt/jwt.server'
import { setAddressVerified } from '~/lib/user.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) return redirect(`/login?redirect=${request.url}`)
  const data = await decodeAddressConfirmation(params)
  if (user.sub !== data.sub) throw new Response(null, { status: 403 })
  await setAddressVerified(user.sub, data.address)
  return redirect('/user')
}
