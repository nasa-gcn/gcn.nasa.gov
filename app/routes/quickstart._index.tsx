/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { FormGroup } from '@trussworks/react-uswds'

import { useUrl } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'
import { getUser } from '~/routes/_auth/user.server'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Sign in / Sign up',
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  return { email: user?.email, idp: user?.idp }
}

export default function () {
  const { email, idp } = useLoaderData<typeof loader>()
  const url = useUrl()
  return (
    <>
      <div className="maxw-tablet">
        {email ? (
          <p className="usa-paragraph">
            Congratulations! You are signed in as <strong>{email}</strong> using{' '}
            <strong>{idp ?? 'username and password'}</strong>.
          </p>
        ) : (
          <p className="usa-paragraph">
            To begin, click the button below to sign up or sign in with a
            username and password, Google, Facebook, or (for NASA employees and
            affiliates) LaunchPad.
          </p>
        )}
        <p className="usa-paragraph">
          <strong>
            Important: make sure you sign in the same way each time.
          </strong>{' '}
          Accounts are <em>not</em> linked.
        </p>
      </div>

      <FormGroup>
        {email ? (
          <Link type="button" className="usa-button" to="credentials">
            Next
          </Link>
        ) : (
          <Link
            type="button"
            className="usa-button"
            to={`/login?redirect=${encodeURIComponent(url)}`}
          >
            Sign in / Sign up
          </Link>
        )}
      </FormGroup>
    </>
  )
}
