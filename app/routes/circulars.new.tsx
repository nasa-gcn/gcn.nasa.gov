/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, Outlet } from '@remix-run/react'
import {
  Button,
  Modal,
  ModalFooter,
  ModalHeading,
} from '@trussworks/react-uswds'

import { useSearchString } from '~/lib/utils'
import { useEmail, usePermissionModerator, useUrl } from '~/root'

function useAuthenticated() {
  return Boolean(useEmail())
}

export default function () {
  return (
    <>
      <Outlet />
      {usePermissionModerator() || <ModalUnauthorized />}
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

function ModalUnauthorized() {
  const searchString = useSearchString()
  const isAuthenticated = useAuthenticated()

  return (
    <Modal
      id="modal-unauthorized"
      aria-labelledby="modal-unauthorized-heading"
      aria-describedby="modal-unauthorized-description"
      isInitiallyOpen
      forceAction
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
