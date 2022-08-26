import { useFetcher, Form, Link } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import { Modal, ModalFooter, ModalHeading } from '@trussworks/react-uswds'
import {
  Grid,
  ButtonGroup,
  Button,
  Icon,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef } from 'react'
import type { EmailNotificationVM } from '~/routes/user/email_notifications.server'
import TimeAgo from './TimeAgo'

export default function EmailNotificationCard({
  uuid,
  name,
  created,
  recipient,
  format,
  noticeTypes,
}: EmailNotificationVM) {
  const ref = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  const disabled = fetcher.state !== 'idle'
  return (
    <>
      <Grid key={uuid} row>
        <Grid row className="full-width-span">
          <div className="tablet:grid-col flex-fill">
            <div className="segmented-card-headline">
              <h3 className="usa-card__heading margin-right-1">{name}</h3>
              <p>
                <small className="text-base-light">
                  Created <TimeAgo time={created}></TimeAgo>
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
            <ButtonGroup>
              <Form method="post">
                <input type="hidden" name="recipient" value={recipient} />
                <input type="hidden" name="intent" value="sendTest" />
                <Button type="submit" outline>
                  <Icon.MailOutline className="bottom-aligned margin-right-05" />
                  Test Message
                </Button>
              </Form>
              <Link
                to={`edit?uuid=${uuid}`}
                className="usa-button usa-button--outline"
              >
                <Icon.Edit className="bottom-aligned margin-right-05" />
                Edit
              </Link>
              <ModalToggleButton
                opener
                disabled={disabled}
                modalRef={ref}
                type="button"
                className="usa-button--secondary margin-right-0"
              >
                <Icon.Delete className="bottom-aligned margin-right-05" />
                Delete
              </ModalToggleButton>
            </ButtonGroup>
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
        ref={ref}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <fetcher.Form method="post">
          <input type="hidden" name="uuid" value={uuid} />
          <input type="hidden" name="intent" value="delete" />
          <ModalHeading id="modal-delete-heading">
            Delete Email Notification
          </ModalHeading>
          <div className="usa-prose">
            <p id="modal-delete-description">
              Are you sure that you want to delete the email notification named
              “{name}”?
            </p>
            <p>This action cannot be undone.</p>
          </div>
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
