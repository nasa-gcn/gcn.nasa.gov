/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { ClientCredentialVendingMachine } from './user.credentials/client_credentials.server'
import HeadingWithAddButton from '~/components/HeadingWithAddButton'
import { handleCredentialLoader } from '~/components/NewCredentialForm'
import { UserCredentials } from '~/components/UserCredentials'
import { getFormDataString } from '~/lib/utils'
import type { SEOHandle } from '~/root/seo'

export const handle: SEOHandle = { noIndex: true }

export const loader = handleCredentialLoader

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
  const { client_credentials, groups } = useLoaderData<typeof loader>()

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
      <p>
        Unused client credentials{' '}
        <Link
          className="usa-link"
          to="/docs/faq#why-are-my-kafka-client-credentials-expiring"
        >
          expire after 30 days
        </Link>
        .
      </p>
      <UserCredentials
        client_credentials={client_credentials}
        groups={groups}
      />
    </>
  )
}
