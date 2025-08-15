/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import CredentialCard from '~/components/CredentialCard'
import {
  NewCredentialForm,
  handleCredentialActions,
  handleCredentialLoader,
} from '~/components/NewCredentialForm'
import SegmentedCards from '~/components/SegmentedCards'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Select Credentials',
  getSitemapEntries: () => null,
}

export const loader = handleCredentialLoader

export async function action({ request }: ActionFunctionArgs) {
  return handleCredentialActions(request, 'quickstart')
}

export default function () {
  const { client_credentials, groups } = useLoaderData<typeof loader>()
  const groupDescriptions = Object.fromEntries(groups)

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
          <SegmentedCards>
            {client_credentials.map((credential) => (
              <CredentialCard
                key={credential.client_id}
                scopeDescription={groupDescriptions[credential.scope]}
                {...credential}
              />
            ))}
          </SegmentedCards>
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
