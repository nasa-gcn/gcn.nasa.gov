/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import CredentialCard from '~/components/CredentialCard'
import {
  NewCredentialForm,
  handleCredentialActions,
  handleCredentialLoader,
} from '~/components/NewCredentialForm'
import RefreshTokenCard from '~/components/RefreshTokenCard'
import SegmentedCards from '~/components/SegmentedCards'
import { useFeature } from '~/root'
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
  const { client_credentials, tokens } = useLoaderData<typeof loader>()

  const tokenAuth = useFeature('TOKEN_AUTH')

  const explanation = tokenAuth ? (
    <>
      Our GCN-Kafka clients now use{' '}
      <Link to="https://datatracker.ietf.org/doc/html/rfc6749#section-1.5">
        Refresh Tokens
      </Link>{' '}
      to authenticate your consumers and producers with our brokers. We ask that
      if you still have existing client credentials saved to your account,
      please delete them and create a refresh token to take its place.
    </>
  ) : (
    <>
      Client credentials allow your scripts to interact with GCN on your behalf.
    </>
  )

  return (
    <>
      {tokens.length > 0 && (
        <>
          <SegmentedCards>
            {tokens.map((token, index) => (
              <RefreshTokenCard key={index} token={token} />
            ))}
          </SegmentedCards>
        </>
      )}
      {client_credentials.length > 0 ? (
        <>
          <p className="usa-paragraph">
            {explanation} Select one of your existing client credentials, or
            create a new one.
          </p>
          <SegmentedCards>
            {client_credentials.map((credential) => (
              <CredentialCard key={credential.client_id} {...credential} />
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
