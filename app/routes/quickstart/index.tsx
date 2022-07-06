/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { getUser } from '~/routes/__auth/user.server'

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  return { email: user?.email, idp: user?.idp, url: request.url }
}

export default function StreamingSteps() {
  const { email, idp, url } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>()
  return (
    <>
      <div className="maxw-tablet">
        {email ? (
          <p>
            Congratulations! You are signed in as <strong>{email}</strong> using{' '}
            <strong>{idp ?? 'username and password'}</strong>.
          </p>
        ) : (
          <p>
            To begin, click the button below to sign up or sign in with a
            username and password, Google, Facebook, or (for NASA employees and
            affiliates) LaunchPad.
          </p>
        )}
        <p>
          <strong>
            Important: make sure you sign in the same way each time.
          </strong>{' '}
          Accounts are <em>not</em> linked.
        </p>
      </div>

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
    </>
  )
}
