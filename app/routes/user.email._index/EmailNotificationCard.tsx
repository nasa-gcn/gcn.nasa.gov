import { Form, useFetcher } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  ButtonGroup,
  Grid,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'

import type { EmailNotificationVM } from '../user.email/email_notices.server'
import { ReCAPTCHA } from '~/components/ReCAPTCHA'
import TimeAgo from '~/components/TimeAgo'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { useRecaptchaSiteKey } from '~/root'

export default function EmailNotificationCard({
  uuid,
  name,
  created,
  recipient,
  format,
  noticeTypes,
}: EmailNotificationVM) {
  const deleteModalRef = useRef<ModalRef>(null)
  const testModalRef = useRef<ModalRef>(null)
  const testConfirmRef = useRef<ModalRef>(null)
  const deleteFetcher = useFetcher()
  const testFetcher = useFetcher()
  const disabled = deleteFetcher.state !== 'idle'
  const [recaptchaValid, setRecaptchaValid] = useState(!useRecaptchaSiteKey())

  useEffect(() => {
    if (
      testFetcher.state === 'idle' &&
      testFetcher.data !== undefined &&
      testModalRef.current
    ) {
      testModalRef.current.toggleModal(undefined, true)
      setRecaptchaValid(false)
      grecaptcha.reset()
    }
  }, [testFetcher.state, testFetcher.data, testModalRef])

  return (
    <>
      <Grid key={uuid} row style={disabled ? { opacity: '50%' } : undefined}>
        <Grid row className="full-width-span">
          <div className="tablet:grid-col flex-fill">
            <div className="segmented-card-headline">
              <h3 className="usa-card__heading margin-right-1">{name}</h3>
              <p>
                <small className="text-base-light">
                  Created <TimeAgo time={created} />
                </small>
              </p>
            </div>
            <div className="display-flex">
              <small>Recipient: {recipient}</small>
            </div>
            <div className="display-flex">
              <small>Notice Format: {format}</small>
            </div>
          </div>
          <div className="tablet:grid-col flex-auto">
            <ToolbarButtonGroup>
              <ModalToggleButton
                opener
                disabled={disabled || testFetcher.state !== 'idle'}
                modalRef={testConfirmRef}
                type="button"
                className="bottom-aligned margin-right-05"
              >
                Test Message
              </ModalToggleButton>
              <Form method="GET" action="edit">
                <input type="hidden" name="uuid" value={uuid} />
                <Button type="submit" outline disabled={disabled}>
                  <Icon.Edit
                    role="presentation"
                    className="bottom-aligned margin-right-05"
                  />
                  Edit
                </Button>
              </Form>
              <ModalToggleButton
                opener
                disabled={disabled}
                modalRef={deleteModalRef}
                type="button"
                className="usa-button--secondary margin-right-0"
              >
                <Icon.Delete
                  role="presentation"
                  className="bottom-aligned margin-right-05"
                />
                Delete
              </ModalToggleButton>
            </ToolbarButtonGroup>
          </div>
        </Grid>
        <Grid row className="width-full">
          <small className="notice-types-overflow">
            Notice Types: {noticeTypes.join(', ')}
          </small>
        </Grid>
      </Grid>
      <Modal
        id="modal-delete"
        ref={deleteModalRef}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <deleteFetcher.Form method="POST">
          <input type="hidden" name="uuid" value={uuid} />
          <input type="hidden" name="intent" value="delete" />
          <ModalHeading id="modal-delete-heading">
            Delete Email Notification
          </ModalHeading>
          <p id="modal-delete-description">
            Are you sure that you want to delete the email notification named “
            {name}”?
          </p>
          <p>This action cannot be undone.</p>
          <ModalFooter>
            <ModalToggleButton modalRef={deleteModalRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Delete
            </Button>
          </ModalFooter>
        </deleteFetcher.Form>
      </Modal>
      <Modal
        id="modal-test"
        ref={testModalRef}
        aria-labelledby="modal-test-heading"
        aria-describedby="modal-test-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <ModalHeading id="modal-test-heading">
          Test Email Notification
        </ModalHeading>
        <p id="modal-test-description">
          A test message has been sent to {recipient}.
        </p>
        <ModalFooter>
          <ModalToggleButton data-close-modal modalRef={testModalRef} closer>
            OK
          </ModalToggleButton>
        </ModalFooter>
      </Modal>
      <Modal
        id="test-confirmation"
        ref={testConfirmRef}
        aria-labelledby="modal-confirm-heading"
        aria-describedby="modal-confirm-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <ModalHeading id="modal-confirm-heading">
          Test Email Confirmation
        </ModalHeading>
        <p id="modal-confirm-description">
          This will send a generic test email to {recipient}. Do you wish to
          continue?
        </p>
        <testFetcher.Form method="POST">
          <ReCAPTCHA
            onChange={(value) => {
              setRecaptchaValid(Boolean(value))
            }}
          />
          <ModalFooter>
            <input type="hidden" name="recipient" value={recipient} />
            <input type="hidden" name="intent" value="sendTest" />
            <ButtonGroup>
              <ModalToggleButton
                data-close-modal
                modalRef={testConfirmRef}
                closer
              >
                Cancel
              </ModalToggleButton>
              <Button
                type="submit"
                outline
                data-close-modal
                disabled={!(recaptchaValid && testFetcher.state === 'idle')}
              >
                <Icon.MailOutline role="presentation" />
                Send
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </testFetcher.Form>
      </Modal>
    </>
  )
}
