/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { HeadersFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData, useSearchParams } from '@remix-run/react'
import {
  Button,
  Modal,
  ModalFooter,
  ModalHeading,
} from '@trussworks/react-uswds'

import { getUser } from './_auth/user.server'
import { CircularEditForm } from './circulars.edit.$circularId/CircularEditForm'
import { formatAuthor } from './circulars/circulars.lib'
import { group } from './circulars/circulars.server'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import { useSearchString } from '~/lib/utils'
import { useUrl } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'New',
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  let isAuthenticated, isAuthorized, formattedAuthor
  if (user) {
    isAuthenticated = true
    if (user.groups.includes(group)) isAuthorized = true
    formattedAuthor = formatAuthor(user)
  }
  return json(
    { isAuthenticated, isAuthorized, formattedAuthor },
    { headers: getCanonicalUrlHeaders(new URL(`/circulars/new`, origin)) }
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

export default function () {
  const { isAuthenticated, isAuthorized, formattedAuthor } =
    useLoaderData<typeof loader>()

  // Get default subject from search params, then strip out
  let [searchParams] = useSearchParams()
  const defaultBody = searchParams.get('body') || ''
  const defaultSubject = searchParams.get('subject') || ''
  const defaultFormat =
    searchParams.get('format') === 'text/markdown'
      ? ('text/markdown' as const)
      : undefined

  searchParams = new URLSearchParams(searchParams)
  searchParams.delete('subject')
  searchParams.delete('body')
  searchParams.delete('format')
  const searchString = searchParams.toString()
  const formDefaults = {
    formattedContributor: formattedAuthor ?? '',
    defaultBody,
    defaultSubject,
    defaultFormat,
    searchString,
    isAuthorized: Boolean(isAuthorized),
  }

  return (
    <>
      <CircularEditForm {...formDefaults} intent="new" />
      {isAuthorized || <ModalUnauthorized isAuthenticated={isAuthenticated} />}
    </>
  )
}

function PeerEndorsementButton() {
  return (
    <Link to="/user/endorsements">
      <Button type="button">Get a peer endorsement</Button>
    </Link>
  )
}

function SignInButton() {
  const url = useUrl()
  return (
    <Link to={`/login?redirect=${encodeURIComponent(url)}`}>
      <Button type="button">Sign in</Button>
    </Link>
  )
}

function ModalUnauthorized({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const searchString = useSearchString()

  return (
    <Modal
      id="modal-unauthorized"
      aria-labelledby="modal-unauthorized-heading"
      aria-describedby="modal-unauthorized-description"
      isInitiallyOpen={true}
      forceAction={true}
      renderToPortal={false}
    >
      <ModalHeading id="modal-unauthorized-heading">
        Get started submitting GCN Circulars
      </ModalHeading>
      <p id="modal-unauthorized-description">
        In order to submit a GCN Circular, you must{' '}
        {isAuthenticated || 'sign in and '}
        get a peer endorsement from an existing GCN Circulars user.
      </p>
      <ModalFooter>
        <Link to={`/circulars${searchString}`}>
          <Button type="button" outline>
            Cancel
          </Button>
        </Link>
        {isAuthenticated ? <PeerEndorsementButton /> : <SignInButton />}
      </ModalFooter>
    </Modal>
  )
}
