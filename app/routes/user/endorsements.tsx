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
import { useCombobox } from 'downshift'
import type { UseComboboxProps } from 'downshift'
import classnames from 'classnames'
import loaderImage from 'app/theme/img/loader.gif'
import { formatAuthor } from '../circulars/circulars.lib'

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

export default function () {
  const { awaitingEndorsements, requestedEndorsements, userIsSubmitter } =
    useLoaderData<typeof loader>()

  return (
    <>
      <h1>Peer Endorsements</h1>
      {userIsSubmitter ? (
        <>
          <p className="usa-paragraph">
            As an approved submitter, you may submit new GCN Circulars. Other
            users may also request an endorsement from you, which you may
            approve, deny, or report in the case of spam.
          </p>
          {awaitingEndorsements.length > 0 && (
            <>
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
            </>
          )}
        </>
      ) : (
        <div>
          <p className="usa-paragraph">
            In order to submit GCN Circulars, you must be endorsed by an already
            approved user.
          </p>
          <EndorsementRequestForm />
          {requestedEndorsements.length > 0 && (
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
          )}
        </div>
      )}
    </>
  )
}

export function EndorsementRequestCard({
  endorsementRequest,
  role,
}: {
  endorsementRequest: EndorsementRequest
  role: EndorsementRole
}) {
  const fetcher = useFetcher()
  const disabled = fetcher.state !== 'idle'

  return (
    <fetcher.Form method="post">
      {role === 'endorser' ? (
        <Grid row style={disabled ? { opacity: '50%' } : undefined}>
          <div className="tablet:grid-col flex-fill">
            <div className="margin-y-0">
              <strong>{endorsementRequest.requestorEmail}</strong>
            </div>
          </div>
          <ButtonGroup className="tablet:grid-col flex-auto flex-align-center">
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
            <Button
              type="submit"
              outline
              disabled={disabled}
              name="intent"
              value="rejected"
            >
              Reject
            </Button>
            <Button
              type="submit"
              secondary
              disabled={disabled}
              name="intent"
              value="reported"
            >
              Reject and Report
            </Button>
          </ButtonGroup>
        </Grid>
      ) : (
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
          {endorsementRequest.status && (
            <ButtonGroup className="tablet:grid-col flex-auto flex-align-center">
              <input
                type="hidden"
                name="endorserSub"
                value={endorsementRequest.endorserSub}
              />
              {endorsementRequest.status !== 'reported' && (
                <Button
                  type="submit"
                  secondary
                  disabled={disabled}
                  name="intent"
                  value="delete"
                >
                  Delete
                </Button>
              )}
            </ButtonGroup>
          )}
        </Grid>
      )}
    </fetcher.Form>
  )
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
    onInputValueChange({ inputValue, isOpen }) {
      if (inputValue && isOpen) {
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

  const loading = fetcher.state === 'submitting'
  const pristine = Boolean(selectedItem)

  return (
    <div
      data-testid="combo-box"
      data-enhanced="true"
      className={classnames('usa-combo-box', className, {
        'usa-combo-box--pristine': pristine || loading,
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
          style={
            loading ? { backgroundImage: `url('${loaderImage}')` } : undefined
          }
          onClick={() => reset()}
          hidden={(!pristine || disabled) && !loading}
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
      <p className="usa-paragraph">
        Requesting an endorsement from another user will share your email with
        that individual. Please keep this in mind when submitting. Enter the
        email of the individual you want to be endorsed by. They will receive a
        notification alerting them to this request.
      </p>
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
