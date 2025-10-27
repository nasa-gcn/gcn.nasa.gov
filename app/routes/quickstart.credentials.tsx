/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import {
  NewCredentialForm,
  handleCredentialActions,
  handleCredentialLoader,
} from '~/components/NewCredentialForm'
import { UserCredentials } from '~/components/UserCredentials'
import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Select Credentials',
  noIndex: true,
}

export const loader = handleCredentialLoader

export async function action({ request }: ActionFunctionArgs) {
  return handleCredentialActions(request, 'quickstart')
}

export default function () {
  const { client_credentials, groups } = useLoaderData<typeof loader>()
  const explanation = (
    <>
      Client credentials allow your scripts to interact with GCN on your behalf.
    </>
  )

  return (
    <>
      {client_credentials.length > 0 ? (
        <>
          <p className="usa-paragraph">
            {explanation} Select one of your existing client credentials, or
            create a new one.
          </p>
          <UserCredentials
            client_credentials={client_credentials}
            groups={groups}
          />
          <div className="padding-2" key="new">
            <strong>New client credentials....</strong>
            <NewCredentialForm />
          </div>
        </>
      ) : (
        <>
          <p className="usa-paragraph">{explanation}</p>
          <NewCredentialForm autoFocus={client_credentials.length === 0} />
        </>
      )}
    </>
  )
}
