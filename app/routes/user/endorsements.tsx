/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  ComboBox,
  Grid,
  Label,
} from '@trussworks/react-uswds'
import { useEffect, useState } from 'react'
import SegmentedCards from '~/components/SegmentedCards'
import { getFormDataString } from '~/lib/utils'
import { getUser } from '../__auth/user.server'
import type { EndorsementRequest } from './endorsements.server'
import { EndorsementsServer } from './endorsements.server'

type IntermediateMappedUser = {
  sub: string
  email: string
  name: string
}

export async function loader({ request }: DataFunctionArgs) {
  const endorsementServer = await EndorsementsServer.create(request)
  const user = await getUser(request)
  const parsedUrl = new URL(request.url)
  const filterString = parsedUrl.searchParams.get('filter')

  // Maps the retrived users to an object that can be used in the ComboBox
  const submitterUsers = await endorsementServer.getSubmitterUsers()
  const validUsers = filterString
    ? (
        submitterUsers
          ?.filter(
            (user) =>
              user.Attributes?.find(
                (attr) => attr.Name == 'name'
              )?.Value?.includes(filterString) ||
              user.Attributes?.find(
                (attr) => attr.Name == 'email'
              )?.Value?.includes(filterString)
          )
          .map((user) =>
            user.Attributes?.filter((attr) =>
              ['sub', 'email', 'name'].includes(attr.Name as string)
            ).reduce(
              (obj, item) =>
                Object.assign(obj, { [item.Name as string]: item.Value }),
              {}
            )
          ) as IntermediateMappedUser[]
      ).map((user) => ({
        value: user.sub,
        label: `${user.name} - ${user.email}`,
      }))
    : []

  const requestedEndorsements = await endorsementServer.getEndorsements(
    'requestor'
  )
  const awaitingEndorsements = await endorsementServer.getEndorsements(
    'endorser'
  )

  return { validUsers, requestedEndorsements, awaitingEndorsements, user }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  const endorserSub = getFormDataString(data, 'endorserSub')
  const requestorSub = getFormDataString(data, 'requestorSub')
  const endorsementServer = await EndorsementsServer.create(request)
  switch (intent) {
    case 'create':
      if (!endorserSub)
        throw new Response('Valid endorser is required', { status: 403 })
      await endorsementServer.createEndorsementRequest(endorserSub)
      break
    case 'approved':
    case 'rejected':
    case 'reported':
      if (!requestorSub)
        throw new Response('Valid requestor is required', { status: 403 })
      await endorsementServer.updateEndorsementRequestStatus(
        intent,
        requestorSub
      )
      break
    case 'delete':
      if (!endorserSub)
        throw new Response('Valid endorser is required', { status: 403 })
      await endorsementServer.deleteEndorsementRequest(endorserSub)
      break
    default:
      throw new Response('unknown intent', {
        status: 400,
      })
  }

  return null
}

export default function Index() {
  const { awaitingEndorsements, requestedEndorsements, user } =
    useLoaderData<typeof loader>()

  return (
    <Grid row>
      <div className="tablet:grid-col-10 flex-fill usa-prose">
        <h1 className="margin-y-0">Endorsements</h1>
      </div>
      {user?.groups.includes('gcn.nasa.gov/circular-submitter') ? (
        <>
          <p>
            As an approved submitter, you may submit new GCN Circulars. Other
            users may also request an endorsement from you, which you may
            approve, deny, or report in the case of spam.
          </p>
          {awaitingEndorsements.length > 0 ? (
            <Grid row>
              <h2>Requests awaiting your review</h2>
              <SegmentedCards>
                {awaitingEndorsements.map((request) => (
                  <EndorsementRequestCard
                    key={request.requestorSub}
                    role="endorser"
                    endorsementRequest={request}
                  />
                ))}
              </SegmentedCards>
            </Grid>
          ) : null}
        </>
      ) : (
        <div>
          <p>
            In order to submit GCN Circulars, you must be endorsed by an already
            approved user.
          </p>
          <EndorsementRequestForm />
          {requestedEndorsements.length > 0 ? (
            <div>
              <h2>Your Pending Requests</h2>
              <SegmentedCards>
                {requestedEndorsements.map((request) => (
                  <EndorsementRequestCard
                    key={request.requestorSub}
                    role="requestor"
                    endorsementRequest={request}
                  />
                ))}
              </SegmentedCards>
            </div>
          ) : null}
        </div>
      )}
    </Grid>
  )
}

export function EndorsementRequestCard({
  endorsementRequest,
  role,
}: {
  endorsementRequest: EndorsementRequest
  role: 'endorser' | 'requestor'
}) {
  const approvalFetcher = useFetcher()
  const rejectFetcher = useFetcher()
  const reportFetcher = useFetcher()

  const disabled =
    approvalFetcher.state !== 'idle' ||
    rejectFetcher.state !== 'idle' ||
    reportFetcher.state !== 'idle'

  if (role == 'endorser') {
    return (
      <Grid row style={disabled ? { opacity: '50%' } : undefined}>
        <div className="tablet:grid-col flex-fill">
          <div className="margin-y-0">
            <strong>{endorsementRequest.requestorEmail}</strong>
          </div>
        </div>
        <ButtonGroup className="tablet:grid-col flex-auto flex-align-center">
          <approvalFetcher.Form method="post">
            <input
              type="hidden"
              name="requestorSub"
              value={endorsementRequest.requestorSub}
            />
            <Button
              type="submit"
              disabled={disabled}
              name="intent"
              value="approved"
            >
              Approve
            </Button>
          </approvalFetcher.Form>
          <rejectFetcher.Form method="post">
            <input
              type="hidden"
              name="requestorSub"
              value={endorsementRequest.requestorSub}
            />
            <Button
              type="submit"
              outline
              disabled={disabled}
              name="intent"
              value="rejected"
            >
              Reject
            </Button>
          </rejectFetcher.Form>
          <reportFetcher.Form method="post">
            <input
              type="hidden"
              name="requestorSub"
              value={endorsementRequest.requestorSub}
            />
            <Button
              type="submit"
              secondary
              disabled={disabled}
              name="intent"
              value="reported"
            >
              Reject and Report
            </Button>
          </reportFetcher.Form>
        </ButtonGroup>
      </Grid>
    )
  } else {
    return (
      <Grid row style={disabled ? { opacity: '50%' } : undefined}>
        <div className="tablet:grid-col flex-fill">
          <div className="margin-y-0">
            <strong>Requested Endorser: </strong>
            {endorsementRequest.endorserEmail}
          </div>
          <div className="margin-y-0">
            <strong>Status: </strong>
            {endorsementRequest.status}
          </div>
        </div>
        {endorsementRequest.status ? (
          <ButtonGroup className="tablet:grid-col flex-auto flex-align-center">
            <reportFetcher.Form method="post">
              <input
                type="hidden"
                name="endorserSub"
                value={endorsementRequest.endorserSub}
              />
              {endorsementRequest.status !== 'reported' ? (
                <Button
                  type="submit"
                  secondary
                  disabled={disabled}
                  name="intent"
                  value="delete"
                >
                  Delete
                </Button>
              ) : null}
            </reportFetcher.Form>
          </ButtonGroup>
        ) : null}
      </Grid>
    )
  }
}

export function EndorsementRequestForm() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])
  const [endorserSub, setEndorserSub] = useState('')
  const fetcher = useFetcher<typeof loader>()

  useEffect(() => {
    const users = fetcher.data?.validUsers
    if (users !== undefined) {
      const test = [
        ...new Map(users.map((item) => [item['value'], item])).values(),
      ]
      setOptions(test)
    }
  }, [fetcher.data])

  const handleInputChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const data = new FormData()
    data.set('filter', value)
    fetcher.submit(data)
  }

  return (
    <Form method="post">
      <h2 id="modal-request-heading">Request Endorsement</h2>
      <div className="usa-prose">
        Requesting an endorsement from another user will share your email with
        that individual. Please keep this in mind when submitting. Enter the
        email of the individual you want to be endorsed by. They will receive a
        notification alerting them to this request.
      </div>
      <Label htmlFor="endorserSubSelect">Endorser</Label>
      <input type="hidden" name="endorserSub" value={endorserSub} />
      <ComboBox
        id="endorserSubSelect"
        name="endorserSubSelect"
        options={options}
        onChange={(e) => setEndorserSub(e ?? '')}
        defaultValue={''}
        inputProps={{ onChange: handleInputChange }}
      />
      <ButtonGroup>
        <Button
          type="submit"
          name="intent"
          value="create"
          disabled={!endorserSub}
        >
          Submit
        </Button>
      </ButtonGroup>
    </Form>
  )
}
