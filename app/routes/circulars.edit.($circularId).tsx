/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs, HeadersFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Icon,
  InputGroup,
  InputPrefix,
  Modal,
  ModalFooter,
  ModalHeading,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import { useState } from 'react'
import { dedent } from 'ts-dedent'

import { getUser } from './_auth/user.server'
import {
  bodyIsValid,
  formatAuthor,
  subjectIsValid,
} from './circulars/circulars.lib'
import { get, group } from './circulars/circulars.server'
import { CircularsKeywords } from '~/components/CircularsKeywords'
import Spinner from '~/components/Spinner'
import { feature } from '~/lib/env.server'
import { pickHeaders } from '~/lib/headers.server'
import { useSearchString } from '~/lib/utils'
import { useUrl } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'Edit',
}

export async function loader({
  request,
  params: { circularId },
}: DataFunctionArgs) {
  const user = await getUser(request)
  let isAuthenticated, isAuthorized, formattedAuthor, isModUser, result

  if (user) {
    isAuthenticated = true
    if (user.groups.includes(group)) isAuthorized = true
    formattedAuthor = formatAuthor(user)
    isModUser = user.groups.includes('gcn.nasa.gov/circular-moderator')

    if (!feature('CIRCULAR_VERSIONS') && circularId)
      throw new Response(null, { status: 404 })

    if (circularId) {
      if (!isModUser)
        throw new Response('you may not directly edit this circular', {
          status: 403,
        })
      result = await get(parseFloat(circularId))
    }
  }
  return json({
    isAuthenticated,
    isAuthorized,
    formattedAuthor,
    isModUser,
    result,
  })
}

export const headers: HeadersFunction = ({ loaderHeaders }) =>
  pickHeaders(loaderHeaders, ['Link'])

function useSubjectPlaceholder() {
  const date = new Date()
  const YY = (date.getUTCFullYear() % 1000).toString().padStart(2, '0')
  const MM = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const DD = date.getUTCDate().toString().padStart(2, '0')
  return `GRB ${YY}${MM}${DD}A: observations of a gamma-ray burst`
}

function useBodyPlaceholder() {
  return dedent(`
    Worf Son of Mogh (Starfleet), Geordi LaForge (Starfleet), Beverly Crusher (Starfleet), Deanna Troi (Starfleet), Data Soong (Starfleet), Isaac Newton (Cambridge), Stephen Hawking (Cambridge), and Albert Einstein (Institute for Advanced Study) report on behalf of a larger collaboration:

    ...
    `)
}

export default function () {
  const { isAuthenticated, isAuthorized, formattedAuthor, result } =
    useLoaderData<typeof loader>()

  // Get default subject from search params, then strip out
  let [searchParams] = useSearchParams()
  const defaultSubject = searchParams.get('subject') || result?.subject || ''
  const defaultBody = searchParams.get('body') || result?.body || ''
  searchParams = new URLSearchParams(searchParams)
  searchParams.delete('subject')
  searchParams.delete('body')
  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  const [subjectValid, setSubjectValid] = useState(
    subjectIsValid(defaultSubject)
  )
  const [bodyValid, setBodyValid] = useState(bodyIsValid(defaultBody))
  const [editSaveType, setEditSaveType] = useState<'save' | 'distribute'>(
    'save'
  )
  const [showKeywords, setShowKeywords] = useState(false)
  const sending = Boolean(useNavigation().formData)
  const valid = subjectValid && bodyValid

  const duplicateBodyMessage =
    'This circular has been marked as a duplicate. \
  See previous versions to view the original content.'

  const mistakeBodyMessage =
    'This circular was submitted accidentally. \
  See previous versions to view the original content.'

  function toggleShowKeywords() {
    setShowKeywords(!showKeywords)
  }

  return (
    <>
      <h1>{result ? 'Edit' : 'New'} GCN Circular</h1>
      {result && (
        <>
          <CircularRevisionWarning />
          <ButtonGroup>
            <Form method="POST" action={`/circulars${searchString}`}>
              <input
                id="circularId"
                name="circularId"
                value={result?.circularId}
                readOnly
                hidden
              />
              <input type="hidden" name="body" value={duplicateBodyMessage} />
              <input
                type="hidden"
                name="subject"
                value="Duplicate Submission"
              />
              <Button type="submit" outline disabled={sending}>
                Mark as Duplicate Submission
              </Button>
            </Form>
            <Form method="POST" action={`/circulars${searchString}`}>
              <input
                id="circularId"
                name="circularId"
                value={result?.circularId}
                readOnly
                hidden
              />
              <input type="hidden" name="body" value={mistakeBodyMessage} />
              <input type="hidden" name="subject" value="Mistaken Submission" />
              <Button type="submit" outline disabled={sending}>
                Mark as Accidental Submission
              </Button>
            </Form>
          </ButtonGroup>
        </>
      )}
      <Form method="POST" action={`/circulars${searchString}`}>
        <input type="hidden" name="editSaveType" value={editSaveType} />
        {result && (
          <InputGroup className="border-0 maxw-full">
            <InputPrefix>From</InputPrefix>
            <span className="padding-1">{result.submitter}</span>
          </InputGroup>
        )}
        <InputGroup className="border-0 maxw-full">
          <input
            id="circularId"
            name="circularId"
            value={result?.circularId}
            readOnly
            hidden
          />
          <InputPrefix>{result ? 'Editor' : 'From'}</InputPrefix>
          <span className="padding-1">{formattedAuthor}</span>
          <Link
            to="/user"
            title="Adjust how your name and affiliation appear in new GCN Circulars"
          >
            <Button unstyled type="button">
              <Icon.Edit role="presentation" /> Edit
            </Button>
          </Link>
        </InputGroup>
        <InputGroup
          className={classnames('maxw-full', {
            'usa-input--error': subjectValid === false,
            'usa-input--success': subjectValid,
          })}
        >
          <InputPrefix>Subject</InputPrefix>
          <TextInput
            autoFocus
            aria-describedby="subjectDescription"
            className="maxw-full"
            name="subject"
            id="subject"
            type="text"
            placeholder={useSubjectPlaceholder()}
            defaultValue={defaultSubject}
            required={true}
            onChange={({ target: { value } }) => {
              setSubjectValid(subjectIsValid(value))
            }}
          />
        </InputGroup>
        <div className="text-base margin-bottom-1" id="subjectDescription">
          <small>
            The subject line must contain (and should start with) the name of
            the transient, which must start with one of the{' '}
            <button
              type="button"
              className="usa-banner__button margin-left-0"
              aria-expanded={showKeywords}
              onClick={toggleShowKeywords}
            >
              <span className="usa-banner__button-text">known keywords</span>
            </button>
            .
          </small>
          {showKeywords && (
            <div className="text-base padding-x-2 padding-bottom-2">
              <CircularsKeywords />
            </div>
          )}
        </div>
        <label hidden htmlFor="body">
          Body
        </label>
        <Textarea
          name="body"
          id="body"
          aria-describedby="bodyDescription"
          placeholder={useBodyPlaceholder()}
          defaultValue={defaultBody}
          required={true}
          className={classnames('maxw-full', {
            'usa-input--success': bodyValid,
          })}
          onChange={({ target: { value } }) => {
            setBodyValid(bodyIsValid(value))
          }}
        />
        <div className="text-base margin-bottom-1" id="bodyDescription">
          <small>
            Body text. If this is your first Circular, please review the{' '}
            <Link to="/docs/circulars/styleguide">style guide</Link>.
          </small>
        </div>
        <ButtonGroup>
          <Link
            to={`/circulars${searchString}`}
            className="usa-button usa-button--outline"
          >
            Back
          </Link>
          {/* TODO: Moderation options for save or save and 
              distribute when edits are made */}

          {result ? (
            <ButtonGroup>
              <Button
                disabled={sending || !valid}
                type="submit"
                onClick={() => setEditSaveType('save')}
              >
                Save Changes
              </Button>
              <Button
                disabled={sending || !valid}
                type="submit"
                onClick={() => setEditSaveType('distribute')}
              >
                Save Changes and Distribute
              </Button>
            </ButtonGroup>
          ) : (
            <Button disabled={sending || !valid} type="submit">
              Send
            </Button>
          )}

          {sending && (
            <div className="padding-top-1 padding-bottom-1">
              <Spinner /> Sending...
            </div>
          )}
        </ButtonGroup>
      </Form>
      {isAuthorized || <ModalUnauthorized isAuthenticated={isAuthenticated} />}
    </>
  )
}

function PeerEndorsementButton() {
  return (
    <Link to="/user/endorsements">
      <Button type="button">Get a peer endorsement</Button>
    </Link>
  )
}

function SignInButton() {
  const url = useUrl()
  return (
    <Link to={`/login?redirect=${encodeURIComponent(url)}`}>
      <Button type="button">Sign in</Button>
    </Link>
  )
}

function ModalUnauthorized({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const searchString = useSearchString()

  return (
    <Modal
      id="modal-unauthorized"
      aria-labelledby="modal-unauthorized-heading"
      aria-describedby="modal-unauthorized-description"
      isInitiallyOpen={true}
      forceAction={true}
      renderToPortal={false}
    >
      <ModalHeading id="modal-unauthorized-heading">
        Get started submitting GCN Circulars
      </ModalHeading>
      <p id="modal-unauthorized-description">
        In order to submit a GCN Circular, you must{' '}
        {isAuthenticated || 'sign in and '}
        get a peer endorsement from an existing GCN Circulars user.
      </p>
      <ModalFooter>
        <Link to={`/circulars${searchString}`}>
          <Button type="button" outline>
            Cancel
          </Button>
        </Link>
        {isAuthenticated ? <PeerEndorsementButton /> : <SignInButton />}
      </ModalFooter>
    </Modal>
  )
}

export function CircularRevisionWarning() {
  return (
    <div className="text-base margin-bottom-1">
      Edits should be restricted to fixing author lists, misspellings, typos, or
      event names, and correcting data that doesn't have substantive impact on
      follow up. If the entry is a duplicate or otherwise accidental submission,
      use these quick-edit buttons to quickly make the respecive changes.
      Otherwise, update and submit the form to create a new version.
    </div>
  )
}
