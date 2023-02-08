/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { DataFunctionArgs } from '@remix-run/node'
import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, Grid, Label } from '@trussworks/react-uswds'
import { useEffect, useState } from 'react'
import SegmentedCards from '~/components/SegmentedCards'
import { getFormDataString } from '~/lib/utils'
import type {
  EndorsementRequest,
  EndorsementRole,
  EndorsementUser,
} from './endorsements.server'
import { EndorsementsServer } from './endorsements.server'
import { formatAuthor } from './index'
import { useCombobox } from 'downshift'
import type { UseComboboxProps } from 'downshift'
import classnames from 'classnames'

export const handle = {
  breadcrumb: 'Peer Endorsements',
  getSitemapEntries: () => null,
}

export async function loader({ request }: DataFunctionArgs) {
  const endorsementServer = await EndorsementsServer.create(request)
  const [requestedEndorsements, awaitingEndorsements] = await Promise.all([
    endorsementServer.getEndorsements('requestor'),
    endorsementServer.getEndorsements('endorser'),
  ])

  const userIsSubmitter = endorsementServer.userIsSubmitter()
  return {
    requestedEndorsements,
    awaitingEndorsements,
    userIsSubmitter,
  }
}

export async function action({ request }: DataFunctionArgs) {
  const [data, endorsementServer] = await Promise.all([
    request.formData(),
    EndorsementsServer.create(request),
  ])
  const intent = getFormDataString(data, 'intent')
  const endorserSub = getFormDataString(data, 'endorserSub')
  const requestorSub = getFormDataString(data, 'requestorSub')
  const filter = getFormDataString(data, 'filter')

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
    case 'filter':
      if (filter?.length) {
        const submitters = (await endorsementServer.getSubmitterUsers())
          .filter(
            ({ name, email }) =>
              name?.includes(filter) || email.includes(filter)
          )
          .slice(0, 5)
        return { submitters }
      }
    default:
      throw new Response('unknown intent', {
        status: 400,
      })
  }

  return null
}

export default function Index() {
  const { awaitingEndorsements, requestedEndorsements, userIsSubmitter } =
    useLoaderData<typeof loader>()

  return (
    <Grid row>
      <div className="tablet:grid-col-10 flex-fill usa-prose">
        <h1 className="margin-y-0">Peer Endorsements</h1>
      </div>
      {userIsSubmitter ? (
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
  role: EndorsementRole
}) {
  const approvalFetcher = useFetcher()
  const rejectFetcher = useFetcher()
  const reportFetcher = useFetcher()

  const disabled =
    approvalFetcher.state !== 'idle' ||
    rejectFetcher.state !== 'idle' ||
    reportFetcher.state !== 'idle'

  if (role === 'endorser') {
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

function EndorserComboBox({
  disabled,
  className,
  ...props
}: { disabled?: boolean; className?: string } & Omit<
  UseComboboxProps<EndorsementUser>,
  'items' | 'onInputValueChange' | 'itemToString'
>) {
  const fetcher = useFetcher<typeof action>()
  const [items, setItems] = useState<EndorsementUser[]>([])

  useEffect(() => {
    setItems(fetcher.data?.submitters ?? [])
  }, [fetcher.data])

  const {
    reset,
    isOpen,
    highlightedIndex,
    selectedItem,
    getMenuProps,
    getInputProps,
    getItemProps,
    getToggleButtonProps,
  } = useCombobox<EndorsementUser>({
    items,
    onInputValueChange({ inputValue }) {
      if (inputValue?.length) {
        const data = new FormData()
        data.set('filter', inputValue.split(' ')[0])
        data.set('intent', 'filter')
        fetcher.submit(data, { method: 'post' })
      } else {
        setItems([])
      }
    },
    itemToString(item) {
      return item ? formatAuthor(item) : ''
    },
    ...props,
  })

  const pristine = Boolean(selectedItem)

  return (
    <div
      data-testid="combo-box"
      data-enhanced="true"
      className={classnames('usa-combo-box', className, {
        'usa-combo-box--pristine': pristine,
      })}
    >
      <input
        autoCapitalize="off"
        autoComplete="off"
        className="usa-combo-box__input"
        {...getInputProps()}
        // Funky escape sequence is a zero-width character to prevent Safari
        // from attempting to autofill the user's own email address, which
        // would be triggered by the presence of the string "email" in the
        // placeholder.
        placeholder="Name or em&#8203;ail address of endorser"
      />
      <span className="usa-combo-box__clear-input__wrapper" tabIndex={-1}>
        <button
          type="button"
          className="usa-combo-box__clear-input"
          aria-label="Clear the select contents"
          onClick={() => reset()}
          hidden={!pristine || disabled}
          disabled={disabled}
        >
          &nbsp;
        </button>
      </span>
      <span className="usa-combo-box__input-button-separator">&nbsp;</span>
      <span className="usa-combo-box__toggle-list__wrapper" tabIndex={-1}>
        <button
          type="button"
          className="usa-combo-box__toggle-list"
          {...getToggleButtonProps()}
        >
          &nbsp;
        </button>
      </span>
      <ul
        {...getMenuProps()}
        className="usa-combo-box__list"
        role="listbox"
        hidden={!isOpen}
      >
        {isOpen &&
          (items.length ? (
            items.map((item, index) => (
              <li
                key={item.sub}
                className={classnames('usa-combo-box__list-option', {
                  'usa-combo-box__list-option--focused':
                    index === highlightedIndex,
                  'usa-combo-box__list-option--selected':
                    selectedItem?.sub === item.sub,
                })}
                {...getItemProps({ item, index })}
              >
                {formatAuthor(item)}
              </li>
            ))
          ) : (
            <li className="usa-combo-box__list-option--no-results">
              No results found
            </li>
          ))}
      </ul>
    </div>
  )
}

export function EndorsementRequestForm() {
  const [endorserSub, setEndorserSub] = useState<string | undefined>()

  return (
    <Form method="post">
      <h2 id="modal-request-heading">Request Endorsement</h2>
      <div className="usa-prose">
        Requesting an endorsement from another user will share your email with
        that individual. Please keep this in mind when submitting. Enter the
        email of the individual you want to be endorsed by. They will receive a
        notification alerting them to this request.
      </div>
      <input type="hidden" name="endorserSub" value={endorserSub} />
      <Grid row>
        <Grid col="fill">
          <Label htmlFor="endorserSubSelect" className="usa-sr-only">
            Endorser
          </Label>
          <EndorserComboBox
            className="maxw-full"
            onSelectedItemChange={({ selectedItem }) =>
              setEndorserSub(selectedItem?.sub)
            }
          />
        </Grid>
        <Grid col="auto">
          <Button
            type="submit"
            name="intent"
            value="create"
            disabled={!endorserSub?.length}
            className="margin-top-1 margin-left-1"
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Form>
  )
}
