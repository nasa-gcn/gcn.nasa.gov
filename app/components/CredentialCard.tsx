/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Form, useFetcher } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  Grid,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef } from 'react'

import TimeAgo from './TimeAgo'
import { ToolbarButtonGroup } from './ToolbarButtonGroup'
import type { RedactedClientCredential } from '~/routes/user.credentials/client_credentials.server'

export default function CredentialCard({
  name,
  client_id,
  created,
  scope,
}: RedactedClientCredential) {
  const ref = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  const disabled = fetcher.state !== 'idle'
  return (
    <>
      <Grid row style={disabled ? { opacity: '50%' } : undefined}>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>{name}</strong>{' '}
              <span>
                (created <TimeAgo time={created} />)
              </span>
            </small>
          </div>
          <div>
            <small>
              scope: <code>{scope}</code>
            </small>
          </div>
          <div>
            <small>
              client ID: <code>{client_id}</code>
            </small>
          </div>
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ToolbarButtonGroup>
            <ModalToggleButton
              opener
              disabled={disabled}
              modalRef={ref}
              type="button"
              className="usa-button--secondary"
            >
              <Icon.Delete
                role="presentation"
                className="bottom-aligned margin-right-05"
              />
              Delete
            </ModalToggleButton>
            <Form
              method="GET"
              action="/quickstart/alerts"
              className="display-inline"
            >
              <input type="hidden" name="clientId" value={client_id} />
              <Button disabled={disabled} type="submit">
                Select
                <Icon.ArrowForward
                  role="presentation"
                  className="bottom-aligned margin-left-05"
                />
              </Button>
            </Form>
          </ToolbarButtonGroup>
        </div>
      </Grid>
      <Modal
        id="modal-delete"
        ref={ref}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <fetcher.Form method="POST">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="clientId" value={client_id} />
          <ModalHeading id="modal-delete-heading">
            Delete Client Credential
          </ModalHeading>
          <p id="modal-delete-description">
            Are you sure that you want to delete the client credential named “
            {name}” with client ID <code>{client_id}</code>?
          </p>
          <p>This action cannot be undone.</p>
          <ModalFooter>
            <ModalToggleButton modalRef={ref} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Delete
            </Button>
          </ModalFooter>
        </fetcher.Form>
      </Modal>
    </>
  )
}
