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
      <h1>Reset Password</h1>
      <PasswordResetForm />
      <h3 className="site-preview-heading margin-0">
        New password must contain:
      </h3>
      <ul className="usa-list">
        <li>A lower case letter</li>
        <li>An upper case letter</li>
        <li>A number</li>
        <li>At least 8 characters</li>
        <li>At least 1 special character or space</li>
        <li>No leading or trailing spaces</li>
      </ul>
    </>
  )
}
