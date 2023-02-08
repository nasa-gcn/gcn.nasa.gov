/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import SegmentedCards from '~/components/SegmentedCards'
import { ClientCredentialVendingMachine } from '../client_credentials.server'
import { Icon } from '@trussworks/react-uswds'
import CredentialCard from '~/components/CredentialCard'
import { getFormDataString } from '~/lib/utils'

export const handle = { getSitemapEntries: () => null }

export async function loader({ request }: DataFunctionArgs) {
  const machine = await ClientCredentialVendingMachine.create(request)
  const client_credentials = await machine.getClientCredentials()
  return { client_credentials }
}

export async function action({ request }: DataFunctionArgs) {
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

export default function Index() {
  const { client_credentials } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="tablet:grid-col-2 flex-auto flex-align-self-center display-flex tablet:margin-right-2">
        <Link className="usa-button margin-left-auto flex-auto" to="edit">
          <Icon.Add className="bottom-aligned margin-right-05" />
          Add
        </Link>
      </div>
      <p>
        Manage your client credentials here. Client credentials allow your
        scripts to interact with GCN on your behalf. You can also create client
        credentials through the{' '}
        <Link to="/quickstart">Start Streaming GCN Notices</Link> quick start
        guide. For sample code demonstrating usage of client credentials, see
        the <Link to="/docs/client">client documentation</Link>.
      </p>
      <SegmentedCards>
        {client_credentials.map((credential) => (
          <CredentialCard key={credential.client_id} {...credential} />
        ))}
      </SegmentedCards>
    </>
  )
}
