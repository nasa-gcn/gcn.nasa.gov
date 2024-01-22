import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  Grid,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
} from '@trussworks/react-uswds'
import { useRef } from 'react'

import { getUser } from './_gcn._auth/user.server'
import type { CircularChangeRequest } from './_gcn.circulars/circulars.lib'
import {
  getChangeRequests,
  moderatorGroup,
} from './_gcn.circulars/circulars.server'
import SegmentedCards from '~/components/SegmentedCards'

export async function action({ request }: ActionFunctionArgs) {
  return null
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const changeRequests = await getChangeRequests(1)
  return {
    changeRequests,
  }
}

export default function () {
  const { changeRequests } = useLoaderData<typeof loader>()

  return (
    <>
      <h1>Circulars Moderation</h1>
      <h2>Pending Corrections</h2>
      <SegmentedCards>
        {changeRequests.map((correction) => (
          <CircularChangeRequestRow
            key={`${correction.circularId}-${correction.requestor}`}
            changeRequest={correction}
          />
        ))}
      </SegmentedCards>
    </>
  )
}

function CircularChangeRequestRow({
  changeRequest,
}: {
  changeRequest: CircularChangeRequest
}) {
  const ref = useRef<ModalRef>(null)
  const fetcher = useFetcher()
  const disabled = fetcher.state !== 'idle'

  return (
    <Grid row>
      <div className="tablet:grid-col flex-fill">
        <div>
          <strong>Circular: </strong>
          {changeRequest.circularId}
        </div>
        <div>
          <strong>Requestor: </strong>
          {changeRequest.requestor}
        </div>
      </div>
      <div className="tablet:grid-col flex-auto margin-y-auto">
        <ModalToggleButton
          opener
          disabled={disabled}
          modalRef={ref}
          type="button"
          outline
        >
          Review
        </ModalToggleButton>
      </div>
      <Modal
        id="modal"
        ref={ref}
        aria-labelledby="modal-heading"
        aria-describedby="modal-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <fetcher.Form method="POST">
          <input
            type="hidden"
            name="circularId"
            value={changeRequest.circularId}
          />
          <ModalHeading id="modal-heading">Review Change Request</ModalHeading>
          <p id="modal-description"></p>
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
    </Grid>
  )
}
