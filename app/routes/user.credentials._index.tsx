/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { ClientCredentialVendingMachine } from './user.credentials/client_credentials.server'
import CredentialCard from '~/components/CredentialCard'
import HeadingWithAddButton from '~/components/HeadingWithAddButton'
import SegmentedCards from '~/components/SegmentedCards'
import { getFormDataString } from '~/lib/utils'

export const handle: SEOHandle = { getSitemapEntries: () => null }

export async function loader({ request }: LoaderFunctionArgs) {
  const machine = await ClientCredentialVendingMachine.create(request)
  const client_credentials = await machine.getClientCredentials()
  return { client_credentials }
}

export async function action({ request }: ActionFunctionArgs) {
  const [data, machine] = await Promise.all([
    request.formData(),
    ClientCredentialVendingMachine.create(request),
  ])

  switch (getFormDataString(data, 'intent')) {
    case 'delete':
      const clientId = getFormDataString(data, 'clientId')
      if (!clientId) {
        throw new Response('clientId not present', { status: 400 })
      }
      await machine.deleteClientCredential(clientId)
      return null

    default:
      throw new Response('unknown intent', { status: 400 })
  }
}

export default function () {
  const { client_credentials } = useLoaderData<typeof loader>()

  return (
    <>
      <HeadingWithAddButton headingLevel={1}>
        Client Credentials
      </HeadingWithAddButton>
      <p className="usa-paragraph">
        Manage your client credentials here. Client credentials allow your
        scripts to interact with GCN on your behalf. You can also create client
        credentials through the{' '}
        <Link className="usa-link" to="/quickstart">
          Start Streaming GCN Notices
        </Link>{' '}
        quick start guide. For sample code demonstrating usage of client
        credentials, see the{' '}
        <Link className="usa-link" to="/docs/client">
          client documentation
        </Link>
        .
      </p>
      <SegmentedCards>
        {client_credentials.map((credential) => (
          <CredentialCard key={credential.client_id} {...credential} />
        ))}
      </SegmentedCards>
    </>
  )
}
