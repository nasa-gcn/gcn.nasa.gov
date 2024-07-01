/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Grid,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import {
  type UseComboboxProps,
  type UseComboboxStateChange,
  useCombobox,
} from 'downshift'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts'

import { formatAuthor } from '../circulars/circulars.lib'
import type {
  EndorsementRequest,
  EndorsementRole,
  EndorsementUser,
} from './endorsements.server'
import { EndorsementsServer } from './endorsements.server'
import SegmentedCards from '~/components/SegmentedCards'
import { getFormDataString } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'

import loaderImage from 'nasawds/src/img/loader.gif'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Peer Endorsements',
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
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

export async function action({ request }: ActionFunctionArgs) {
  const [data, endorsementServer] = await Promise.all([
    request.formData(),
    EndorsementsServer.create(request),
  ])
  const intent = getFormDataString(data, 'intent')
  const endorserSub = getFormDataString(data, 'endorserSub')
  const requestorSub = getFormDataString(data, 'requestorSub')
  const filter = getFormDataString(data, 'filter')
  const note = getFormDataString(data, 'note') ?? ''

  switch (intent) {
    case 'create':
      if (!endorserSub)
        throw new Response('Valid endorser is required', { status: 403 })
      await endorsementServer.createEndorsementRequest(endorserSub, note)
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
      <p className="usa-intro">
        Anyone can become a <Link to="/circulars">GCN Circulars</Link> submitter
        by receiving a <i>peer endorsement</i> from an existing submitter. An
        endorsement vouches that the user is in good standing with the astronomy
        community.
      </p>
      <p className="usa-paragraph">
        Peer endorsements (inspired by{' '}
        <a
          rel="external noopener"
          target="_blank"
          href="https://info.arxiv.org/help/endorsement.html"
        >
          arXiv
        </a>
        ) help us to grow the GCN community sustainably while protecting the
        research integrity of GCN Circulars. We welcome submitters of diverse
        backgrounds including professional astronomers, amateurs, educators, and
        students.
      </p>
      {userIsSubmitter ? (
        <>
          <h2>Approve Endorsements</h2>
          <p className="usa-paragraph">
            <b>You are a GCN Circulars submitter.</b> You can{' '}
            <Link className="usa-link" to="/circulars/new">
              submit GCN Circulars
            </Link>
            , and other users can request peer endorsements from you. You may
            take any of the following actions for peer endorsement requests:
          </p>
          <ol className="usa-list">
            <li>
              <b>Approve</b> if you know the user and you can vouch that they
              are in good standing.
            </li>
            <li>
              <b>Reject</b> if you do not know the user or cannot vouch for
              them.
            </li>
            <li>
              <b>Reject and Report</b> if you believe that the request is spam
              or is from a bot.
            </li>
          </ol>
          <h3>Requests awaiting your review</h3>
          {awaitingEndorsements.length > 0 ? (
            <SegmentedCards>
              {awaitingEndorsements.map((request) => (
                <EndorsementRequestCard
                  key={request.requestorSub}
                  role="endorser"
                  endorsementRequest={request}
                />
              ))}
            </SegmentedCards>
          ) : (
            <p className="usa-paragraph">
              You have no peer endorsement requests right now. When you do, they
              will appear here.
            </p>
          )}
        </>
      ) : (
        <>
          <h2>Request Endorsements</h2>
          <p className="usa-paragraph">
            <b>
              You are not yet a GCN Circulars submitter. Use the form below to
              request an endorsement from an existing GCN Circulars user.
            </b>{' '}
            This should be someone who you know and who knows you: a fellow
            researcher, an advisor, or an instructor.
          </p>
          <p className="usa-paragraph">
            If you don't find anyone who you recognize, then{' '}
            <Link className="usa-link" to="/contact">
              contact us for help
            </Link>
            .
          </p>
          <EndorsementRequestForm />
          {requestedEndorsements.length > 0 && (
            <>
              <h3>Your Endorsement Requests</h3>
              <p className="usa-paragraph">
                You are waiting on pending endorsements. When any of the users
                below approves your request, you will become a GCN Circulars
                submitter.
              </p>
              <SegmentedCards>
                {requestedEndorsements.map((request) => (
                  <EndorsementRequestCard
                    key={request.requestorSub}
                    role="requestor"
                    endorsementRequest={request}
                  />
                ))}
              </SegmentedCards>
            </>
          )}
        </>
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
  const [showMore, setShowMore] = useState(false)

  const noteRef = useRef<HTMLSpanElement>(null)
  const noteContainerRef = useRef<HTMLDivElement>(null)

  const { width } = useResizeObserver({ ref: noteRef })
  const { width: containerWidth } = useResizeObserver({ ref: noteContainerRef })

  return (
    <fetcher.Form method="POST">
      {role === 'endorser' ? (
        <Grid row style={disabled ? { opacity: '50%' } : undefined}>
          <div className="tablet:grid-col flex-fill order-first">
            <div className="margin-y-0">
              <strong>{endorsementRequest.requestorEmail}</strong>
            </div>
            {endorsementRequest.note && (
              <div className="margin-top-0 margin-bottom-1">
                Comments from the user:
                {((width !== undefined &&
                  containerWidth !== undefined &&
                  width > containerWidth) ||
                  showMore) && (
                  <Button
                    type="button"
                    unstyled
                    aria-label="Show or hide the comments provided by the requestor"
                    aria-expanded={showMore}
                    onClick={() => setShowMore(!showMore)}
                  >
                    Show{' '}
                    {showMore ? (
                      <>
                        less <Icon.ArrowDropUp role="presentation" />
                      </>
                    ) : (
                      <>
                        more <Icon.ArrowDropDown role="presentation" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="tablet:grid-col flex-auto order-last">
            <ButtonGroup type="default">
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
          </div>
          {endorsementRequest.note && (
            <div
              ref={noteContainerRef}
              aria-label="Additional comments provided by the requestor"
              className={
                'grid-col-12 tablet:order-last ' +
                (!showMore ? 'notice-types-overflow' : '')
              }
            >
              <span ref={noteRef}>{endorsementRequest.note}</span>
            </div>
          )}
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

interface EndorsementComboBoxProps
  extends Omit<
    UseComboboxProps<EndorsementUser>,
    'items' | 'onInputValueChange' | 'itemToString'
  > {
  disabled?: boolean
  className?: string
}

interface EndorsementComboBoxHandle {
  reset: () => void
}

const EndorserComboBox = forwardRef<
  EndorsementComboBoxHandle,
  EndorsementComboBoxProps
>(({ disabled, className, ...props }, ref) => {
  const fetcher = useFetcher<typeof action>()
  const [items, setItems] = useState<EndorsementUser[]>([])

  useEffect(() => {
    setItems(fetcher.data?.submitters ?? [])
  }, [fetcher.data])

  const onInputValueChange = useDebounceCallback(
    ({ inputValue, isOpen }: UseComboboxStateChange<EndorsementUser>) => {
      if (inputValue && isOpen) {
        const data = new FormData()
        data.set('filter', inputValue.split(' ')[0])
        data.set('intent', 'filter')
        fetcher.submit(data, { method: 'POST' })
      } else {
        setItems([])
      }
    },
    500,
    { trailing: true }
  )

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
    onInputValueChange,
    itemToString(item) {
      return item ? formatAuthor(item) : ''
    },
    ...props,
  })

  useImperativeHandle(
    ref,
    () => ({
      reset,
    }),
    [reset]
  )

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
        disabled={disabled}
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
})

export function EndorsementRequestForm() {
  const ref = useRef<EndorsementComboBoxHandle>(null)
  const [endorserSub, setEndorserSub] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === 'idle' && submitting) {
      setSubmitting(false)
      ref.current?.reset()
    }
  }, [ref, fetcher.state, submitting])

  return (
    <fetcher.Form method="POST" onSubmit={() => setSubmitting(true)}>
      <input type="hidden" name="endorserSub" value={endorserSub} />
      <Grid row>
        <Grid col="fill">
          <Label htmlFor="endorserSubSelect" className="usa-sr-only">
            Endorser
          </Label>
          <EndorserComboBox
            className="maxw-full"
            disabled={submitting}
            ref={ref}
            onSelectedItemChange={({ selectedItem }) =>
              setEndorserSub(selectedItem?.sub ?? '')
            }
          />
        </Grid>
      </Grid>
      <Grid row>
        <Grid tablet={{ col: 'fill' }}>
          <TextInput
            id="note"
            name="note"
            type="text"
            placeholder="Optional message to the endorser"
          />
        </Grid>
        <Grid tablet={{ col: 'auto' }}>
          <Button
            type="submit"
            name="intent"
            value="create"
            disabled={submitting || !endorserSub}
            className="margin-top-1 tablet:margin-left-1 tablet:margin-right-0"
          >
            {submitting ? 'Requesting...' : 'Request'}
          </Button>
        </Grid>
      </Grid>
    </fetcher.Form>
  )
}
