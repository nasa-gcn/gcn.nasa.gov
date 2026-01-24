/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Form, useFetcher, useSearchParams } from '@remix-run/react'
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

import HumanNumber from './HumanNumber'
import TimeAgo from './TimeAgo'
import { ToolbarButtonGroup } from './ToolbarButtonGroup'
import { EXPIRATION_MILLIS, WARNING_MILLIS } from '~/lib/cognito'
import type { RedactedClientCredential } from '~/routes/user.credentials/client_credentials.server'

export default function CredentialCard({
  name,
  client_id,
  created,
  scope,
  scopeDescription,
  lastUsed,
  countUsed,
  expired,
}: RedactedClientCredential & { scopeDescription?: string }) {
  const ref = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  const [searchParams] = useSearchParams()
  const disabled = fetcher.state !== 'idle'
  const alerts = searchParams.getAll('alerts')
  const showExpirationWarning = !(
    expired || Date.now() - (lastUsed ?? created) <= WARNING_MILLIS
  )

  return (
    <>
      <Grid row style={disabled ? { opacity: '50%' } : undefined}>
        <div
          className="tablet:grid-col flex-fill"
          style={expired ? { opacity: '50%' } : undefined}
        >
          <div>
            <small>
              <strong>{name}</strong>{' '}
              <span>
                (created <TimeAgo time={created} />,{' '}
                {expired ? (
                  <>
                    expired <TimeAgo time={expired} />
                  </>
                ) : (
                  <>
                    {countUsed && (
                      <>
                        used <HumanNumber n={countUsed} /> times,{' '}
                      </>
                    )}
                    {lastUsed ? (
                      <>
                        last used <TimeAgo time={lastUsed} />
                      </>
                    ) : (
                      <>never used</>
                    )}
                  </>
                )}
                )
              </span>
            </small>
          </div>
          {showExpirationWarning && (
            <small className="text-error">
              This credential will expire{' '}
              {lastUsed ? (
                <TimeAgo time={lastUsed + EXPIRATION_MILLIS} />
              ) : (
                'today'
              )}{' '}
              if not used to connect to our Kafka brokers.
            </small>
          )}

          <div>
            <small>
              scope: <code title={scopeDescription}>{scope}</code>
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
              <Icon.Delete role="presentation" className="margin-y-neg-2px" />
              Delete
            </ModalToggleButton>
            <Form method="GET" action="/quickstart/alerts">
              <input type="hidden" name="clientId" value={client_id} />
              <input
                type="hidden"
                name="groupType"
                value={scope.endsWith('-consumer') ? 'consumer' : 'producer'}
              />
              {alerts.map((alert) => (
                <input key={alert} type="hidden" name="alerts" value={alert} />
              ))}
              <Button disabled={disabled || Boolean(expired)} type="submit">
                Select
                <Icon.ArrowForward
                  role="presentation"
                  className="margin-y-neg-2px"
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
