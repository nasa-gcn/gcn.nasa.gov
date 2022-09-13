/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Form, useFetcher } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  ButtonGroup,
  Button,
  Icon,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef } from 'react'
import TimeAgo from './TimeAgo'

interface CardProps {
  uuid: string
  subject: string
  date: number
  moderatorPermission?: boolean
  created?: string
}

export default function SubmittedCircularCard(props: CardProps) {
  const deleteFetcher = useFetcher()
  const deleteModalRef = useRef<ModalRef>(null)
  return (
    <>
      <div className="grid-row">
        <div className="tablet:grid-col flex-fill">
          <div className="segmented-card-headline">
            <h3 className="usa-card__heading margin-right-1">
              {props.subject}
            </h3>
            <p className="margin-y-0">
              <small className="text-base-light">
                Created <TimeAgo time={props.date}></TimeAgo>
              </small>
            </p>
          </div>
        </div>
        <ButtonGroup className="tablet:grid-col flex-auto flex-align-center">
          <Form method="get" action="edit">
            <input type="hidden" name="intent" value="edit" />
            <input type="hidden" name="created" value={props.created} />
            <input type="hidden" name="id" value={props.uuid} />
            <Button type="submit" outline>
              Post Erratum
            </Button>
          </Form>
          {props.moderatorPermission ? (
            <ModalToggleButton
              opener
              modalRef={deleteModalRef}
              type="button"
              className="usa-button--secondary margin-right-0"
            >
              <Icon.Delete className="bottom-aligned margin-right-05" />
              Delete
            </ModalToggleButton>
          ) : null}
        </ButtonGroup>
      </div>
      <Modal
        id="modal-delete"
        ref={deleteModalRef}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <deleteFetcher.Form method="post">
          <input type="hidden" name="uuid" value={props.uuid} />
          <input type="hidden" name="intent" value="delete" />
          <ModalHeading id="modal-delete-heading">Delete Circular</ModalHeading>
          <div className="usa-prose">
            <p id="modal-delete-description">
              Are you sure that you want to delete the circular “{props.subject}
              ”?
            </p>
            <p>This action cannot be undone.</p>
          </div>
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
    </>
  )
}
