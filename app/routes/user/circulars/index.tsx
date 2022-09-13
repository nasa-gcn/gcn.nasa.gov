/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import { Button, ModalFooter } from '@trussworks/react-uswds'
import {
  Label,
  Modal,
  ModalHeading,
  ModalToggleButton,
  TextInput,
} from '@trussworks/react-uswds'
import { useRef } from 'react'
import ApprovalRequestCard from '~/components/ApprovalRequestCard'
import SegmentedCards from '~/components/SegmentedCards'
import SubmittedCircularCard from '~/components/SubmittedCircularCard'
import { getFormDataString, getLatestUserGroups } from '~/lib/utils'
import { CircularsServer } from '~/routes/api/circulars.server'
import { getUser } from '~/routes/__auth/user.server'
import { EndorsementsServer } from '../endorsements.server'

export async function action({ request }: DataFunctionArgs) {
  const [data] = await Promise.all([request.formData()])
  const server = await EndorsementsServer.create(request)
  const intent = getFormDataString(data, 'intent')
  switch (intent) {
    case 'create':
      await server.handleEndorsementCreateRequest(data)
      return null
    case 'update':
      await server.handleEndorsementUpdateRequest(data)
      return null
    case 'subscribe':
      await server.createCircularEmailNotification(
        getFormDataString(data, 'recipientEmail')
      )
      return redirect('/user/circulars')
    case 'unsubscribe':
      await server.deleteCircularEmailNotification()
      return redirect('/user/circulars')
    case 'update_circular':
      await server.updateCircularEmailNotification()
      return redirect('/user/circulars')
    case 'userDataUpdate':
      console.log(getFormDataString(data, 'name'))
      console.log(getFormDataString(data, 'association'))
      // Save these fields somewhere, use as 'FROM'
      return null
    default:
      const id = getFormDataString(data, 'id')
      if (!id || !intent) return null
      await server.handleEndorsementStatusUpdate(id, intent)
      return null
  }
}

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  const server = await EndorsementsServer.create(request)
  const existingRequest = await server.getUsersEndorsementStatus()
  const pendingRequests = await server.getPendingEndorsementRequests()
  const circularsServer = await CircularsServer.create(request)
  const submittedCirculars = await circularsServer.getUserSubmittedCirculars()
  const userSubscribed =
    await server.getUserCircularNotificationSubscribedEmail()
  if (
    existingRequest.status == 'approved' &&
    user?.groups.indexOf('gcn.nasa.gov/circular-submitter') == -1
  ) {
    await getLatestUserGroups(user)
  }
  return {
    existingRequest: existingRequest,
    pendingRequests: pendingRequests,
    submittedCirculars: submittedCirculars,
    email: user?.email,
    name: null,
    association: null,
    userSubscribed: userSubscribed,
    modPrivileges:
      (user?.groups &&
        user?.groups.indexOf('gcn.nasa.gov/circular-moderator') > -1) ??
      false,
    subPrivileges:
      (user?.groups &&
        user?.groups.indexOf('gcn.nasa.gov/circular-submitter') > -1) ??
      false,
  }
}

export default function Index() {
  const ref = useRef<ModalRef>(null)
  const updateRef = useRef<ModalRef>(null)
  const emailRef = useRef<ModalRef>(null)
  const userDataRef = useRef<ModalRef>(null)

  const fetcher = useFetcher()
  const subFetcher = useFetcher()
  const userDataFetcher = useFetcher()

  const userData = useLoaderData<typeof loader>()
  const disabled = fetcher.state !== 'idle'
  return (
    <>
      <div className="tablet:grid-col-sm-12">
        {userData.userSubscribed.email ? (
          <>
            <p className="margin-bottom-0">
              You are currently subscribed to receive notifications via email
              with: {userData.userSubscribed.email}
            </p>
            <subFetcher.Form method="post">
              <input type="hidden" name="intent" value="unsubscribe" />
              <Button type="submit" unstyled>
                Unsubscribe
              </Button>
            </subFetcher.Form>
          </>
        ) : (
          <div className="grid-row">
            <ModalToggleButton
              opener
              modalRef={emailRef}
              type="button"
              unstyled
              className="usa-button--secondary"
              disabled={disabled}
            >
              Subscribe to GCN Circular Emails
            </ModalToggleButton>
            &nbsp;to receive Circulars to your inbox.
          </div>
        )}
        <p>
          Publishing circulars requires peer endorsement. More text here
          describing what that means, and why.
        </p>
        <p>
          Your Current Status:{' '}
          <strong>{userData.existingRequest.status}</strong>
        </p>

        {userData.existingRequest.status == 'pending' ||
        userData.existingRequest.status == 'rejected' ? (
          <div className="grid-row">
            <ModalToggleButton
              opener
              modalRef={updateRef}
              type="button"
              unstyled
              className="usa-button--secondary"
              disabled={disabled}
            >
              Update Endorsement Request
            </ModalToggleButton>
          </div>
        ) : null}
        {userData.existingRequest.status == 'unrequested' ? (
          <div className="grid-row">
            <ModalToggleButton
              opener
              modalRef={ref}
              type="button"
              unstyled
              className="usa-button--secondary"
              disabled={disabled}
            >
              Request Endorsement
            </ModalToggleButton>
          </div>
        ) : null}
        {userData.subPrivileges ? (
          <>
            <p>
              As an approved user, you may{' '}
              <Link to="/circulars/submit">submit</Link> new circulars and new
              users may request to be endorsed by you.
            </p>
            <p className="margin-bottom-0">
              The 'FROM' field in any circular you submit will default to:
            </p>
            <p className="margin-y-0">
              {userData.name
                ? userData.name +
                  ' at ' +
                  userData.association +
                  ' <' +
                  userData.email +
                  '>'
                : ''}
            </p>
            <p className="margin-top-0">
              <ModalToggleButton
                opener
                modalRef={userDataRef}
                type="button"
                unstyled
                className="usa-button--secondary"
                disabled={disabled}
              >
                Update User Defaults
              </ModalToggleButton>
            </p>
            <p className="text-secondary">
              Only approve requests you trust. Any spam should be reported.
            </p>
            {userData.pendingRequests.length ? (
              <>
                <h3>Pending Requests</h3>
                <SegmentedCards>
                  {userData.pendingRequests.map((userReq) => (
                    <ApprovalRequestCard key={userReq.uuid} {...userReq} />
                  ))}
                </SegmentedCards>
              </>
            ) : null}
            {userData.submittedCirculars.length ? (
              <>
                <h3>Submitted Circulars</h3>
                <SegmentedCards>
                  {userData.submittedCirculars.map((circular) => (
                    <SubmittedCircularCard
                      uuid={circular.id ?? ''}
                      date={0}
                      key={circular.id}
                      {...circular}
                      moderatorPermission={userData.modPrivileges}
                    />
                  ))}
                </SegmentedCards>
              </>
            ) : null}
          </>
        ) : null}
      </div>
      <Modal
        id="modal-create"
        ref={ref}
        aria-labelledby="modal-create-heading"
        aria-describedby="modal-create-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="create" />
          <ModalHeading id="modal-request-heading">
            Request Endorsement
          </ModalHeading>
          <div className="usa-prose">
            Requesting an endorsement from another user will share your email
            with that individual. Please keep this in mind when submitting.
            Enter the email of the individual you want to be endorsed by. They
            will receive a notification alerting them to this reqest.
            [Consequence for spamming/random emails?]
          </div>
          <Label htmlFor="reviewerEmail">Reviewer Email</Label>
          <TextInput
            id="reviewerEmail"
            name="reviewerEmail"
            type="email"
            placeholder="Enter a valid Email"
          />
          <ModalFooter>
            <ModalToggleButton modalRef={ref} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Submit
            </Button>
          </ModalFooter>
        </fetcher.Form>
      </Modal>
      <Modal
        id="modal-update"
        ref={updateRef}
        aria-labelledby="modal-update-heading"
        aria-describedby="modal-update-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="update" />
          <input
            type="hidden"
            name="requestId"
            value={userData.existingRequest.uuid}
          />
          <ModalHeading id="modal-update-request-heading">
            Update Endorsement Request
          </ModalHeading>
          <div className="usa-prose">
            You have previously requested an approval from{' '}
            {userData.existingRequest.endorserEmail}.
          </div>
          <Label htmlFor="reviewerEmail">Reviewer Email</Label>
          <TextInput
            id="reviewerEmail"
            name="reviewerEmail"
            type="email"
            placeholder="Enter a valid Email"
            defaultValue={userData.existingRequest.endorserEmail}
          />
          <ModalFooter>
            <ModalToggleButton modalRef={updateRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Submit
            </Button>
          </ModalFooter>
        </fetcher.Form>
      </Modal>
      <Modal
        id="modal-subscribe"
        ref={emailRef}
        aria-labelledby="modal-subscribe-heading"
        aria-describedby="modal-subscribe-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <subFetcher.Form method="post">
          <input type="hidden" name="intent" value="subscribe" />
          <ModalHeading id="modal-subscribe-heading">
            Subscribe to receive emails
          </ModalHeading>
          <div className="usa-prose">
            Please enter the email to which you would like to receive GCN
            Circulars.
          </div>
          <Label htmlFor="recipientEmail">Recipient Email</Label>
          <TextInput
            id="recipientEmail"
            name="recipientEmail"
            type="email"
            placeholder="Enter a valid Email"
            required
            defaultValue={userData.email}
          />
          <ModalFooter>
            <ModalToggleButton modalRef={emailRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Submit
            </Button>
          </ModalFooter>
        </subFetcher.Form>
      </Modal>
      <Modal
        id="modal-user-defaults"
        ref={userDataRef}
        aria-labelledby="modal-user-defaults-heading"
        aria-describedby="modal-user-defaults-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <userDataFetcher.Form method="post">
          <input type="hidden" name="intent" value="userDataUpdate" />
          <ModalHeading id="modal-user-defaults-heading">
            Subscribe to receive emails
          </ModalHeading>
          <div className="usa-prose">
            Please enter your name and association as you would like them to
            appear on circulars you submit.
          </div>
          <Label htmlFor="name">Name</Label>
          <TextInput
            id="name"
            name="name"
            type="text"
            placeholder="Your Name"
            required
            defaultValue={userData.name ?? ''}
          />
          <Label htmlFor="association">Association</Label>
          <TextInput
            id="association"
            name="association"
            type="text"
            placeholder="Your Association"
            required
            defaultValue={userData.association ?? ''}
          />
          <ModalFooter>
            <ModalToggleButton modalRef={userDataRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Submit
            </Button>
          </ModalFooter>
        </userDataFetcher.Form>
      </Modal>
    </>
  )
}
