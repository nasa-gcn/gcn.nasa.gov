/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Form, Link, useFetcher } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Alert,
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
import type { ScopedRefreshToken } from '~/routes/_auth/user.server'

export default function RefreshTokenCard({
  token,
}: {
  token: Omit<ScopedRefreshToken, 'token'>
}) {
  const ref = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  const disabled = fetcher.state !== 'idle'
  return (
    <>
      <Grid row style={disabled ? { opacity: '50%' } : undefined}>
        <div className="tablet:grid-col flex-fill">
          <div>
            <small>
              <strong>{token.name}</strong>{' '}
              <span>
                (created <TimeAgo time={token.createdOn} />)
              </span>
            </small>
          </div>
          <div>
            <small>
              scope: <code>{token.scope}</code>
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
            <Link
              to={`/user/token/${token.uuid}`}
              className="usa-button usa-button--outline"
              target="_blank"
            >
              <Icon.FileDownload
                role="presentation"
                className="bottom-aligned margin-right-05"
              />
              Download
            </Link>
            <Form
              method="GET"
              action="/quickstart/alerts"
              className="display-inline"
            >
              <input type="hidden" name="tokenId" value={token.uuid} />
              <input type="hidden" name="scope" value={token.scope} />
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
          <input type="hidden" name="intent" value="delete-token" />
          <input type="hidden" name="uuid" value={token.uuid} />
          <ModalHeading id="modal-delete-heading">Delete Token</ModalHeading>
          <p id="modal-delete-description">
            Are you sure that you want to delete the token named “{token.name}”?
            This action will revoke the validity of this token.
          </p>
          <Alert slim type="error" headingLevel="h1">
            You will need to delete it from any machines where you are using it.
          </Alert>
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
