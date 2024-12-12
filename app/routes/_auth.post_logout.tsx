/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import {
  Button,
  Modal,
  ModalFooter,
  ModalHeading,
} from '@trussworks/react-uswds'

import { storage } from './_auth/auth.server'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function loader({ request: { headers } }: LoaderFunctionArgs) {
  const session = await storage.getSession(headers.get('Cookie'))
  const existingIdp = session.get('existingIdp')
  if (session.id) await storage.destroySession(session)

  if (existingIdp) return { existingIdp }
  throw redirect('/')
}

export default function () {
  const { existingIdp } = useLoaderData<typeof loader>()
  const friendlyExistingIdp =
    existingIdp == 'COGNITO' ? 'email and password' : existingIdp
  return (
    <Modal
      id="modal-existing-idp"
      aria-labelledby="modal-existing-idp"
      aria-describedby="modal-existing-idp-description"
      isInitiallyOpen
      forceAction
      renderToPortal={false}
    >
      <ModalHeading id="modal-existing-idp-heading">
        That email address is already registered
      </ModalHeading>
      <div id="modal-existing-idp-description">
        <p>
          You already have an existing account with the same email address. Last
          time that you signed in, you used <b>{friendlyExistingIdp}</b>. Would
          you like to try signing in that way again?
        </p>
        <p className="text-base">
          To change your sign-in method,{' '}
          <a href="/contact">contact us for help</a>.
        </p>
      </div>
      <ModalFooter>
        <Form action="/login">
          <input type="hidden" name="identity_provider" value={existingIdp} />
          <Link to="/">
            <Button type="button" outline>
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="btn-default">
            Sign in using {friendlyExistingIdp}
          </Button>
        </Form>
      </ModalFooter>
    </Modal>
  )
}
