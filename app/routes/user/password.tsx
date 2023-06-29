/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'

import {
  PasswordResetForm,
  handlePasswordActions,
} from '~/components/PasswordResetForm'

export const handle = {
  breadcrumb: 'Password',
  getSitemapEntries: () => null,
}

export async function action({ request }: DataFunctionArgs) {
  return handlePasswordActions(request, 'user')
}

export default function () {
  return (
    <>
      <h1>Update Password</h1>
      <PasswordResetForm />
    </>
  )
}
