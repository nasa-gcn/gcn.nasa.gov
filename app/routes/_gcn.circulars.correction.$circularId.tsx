/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import {
  Button,
  Modal,
  ModalFooter,
  ModalHeading,
} from '@trussworks/react-uswds'

import { getUser } from './_gcn._auth/user.server'
import { CircularEditForm } from './_gcn.circulars.edit.$circularId/CircularEditForm'
import { formatAuthor } from './_gcn.circulars/circulars.lib'
// import { formatAuthor } from './_gcn.circulars/circulars.lib'
import { get } from './_gcn.circulars/circulars.server'
import { useSearchString } from '~/lib/utils'
import { useUrl } from '~/root'

export async function loader({
  params: { circularId },
  request,
}: LoaderFunctionArgs) {
  if (!circularId) throw new Response(null, { status: 404 })

  const user = await getUser(request)
  const isAuthenticated = user !== undefined
  const circular = await get(parseFloat(circularId))
  const data = {
    formattedContributor: user ? formatAuthor(user) : '',
    defaultBody: circular.body,
    defaultSubject: circular.subject,
    circularId: circular.circularId,
    submitter: circular.submitter,
    searchString: '',
  }
  return { isAuthenticated, data }
}

export default function () {
  const { isAuthenticated, data } = useLoaderData<typeof loader>()
  return (
    <>
      <CircularEditForm {...data} intent="correction" />
      {isAuthenticated || <ModalUnauthorized />}
    </>
  )
}

function ModalUnauthorized() {
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
        Submit a Correction
      </ModalHeading>
      <p id="modal-unauthorized-description">
        In order to submit a correction for a GCN Circular, you must sign in.
      </p>
      <ModalFooter>
        <Link to={`/circulars${searchString}`}>
          <Button type="button" outline>
            Cancel
          </Button>
        </Link>
        <SignInButton />
      </ModalFooter>
    </Modal>
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
