/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import classnames from 'classnames'
import type { DataFunctionArgs } from '@remix-run/node'
import { Link, Form, useNavigation, useLoaderData } from '@remix-run/react'
import {
  TextInput,
  Textarea,
  Button,
  ButtonGroup,
  Icon,
  Modal,
  ModalHeading,
  ModalFooter,
} from '@trussworks/react-uswds'
import { useState } from 'react'
import dedent from 'ts-dedent'
import Spinner from '~/components/Spinner'
import { getUser } from '../__auth/user.server'
import { bodyIsValid, formatAuthor, subjectIsValid } from './circulars.lib'
import { feature, useUrl } from '~/root'
import { group } from './circulars.server'

export async function loader({ request }: DataFunctionArgs) {
  if (!feature('circulars')) throw new Response(null, { status: 404 })
  const user = await getUser(request)
  let isAuthenticated, isAuthorized, formattedAuthor
  if (user) {
    isAuthenticated = true
    if (user.groups.includes(group)) isAuthorized = true
    formattedAuthor = formatAuthor(user)
  }
  return { isAuthenticated, isAuthorized, formattedAuthor }
}

function useSubjectPlaceholder() {
  const date = new Date()
  return `GRB ${(date.getUTCFullYear() % 1000)
    .toString()
    .padStart(2, '0')}${date.getUTCMonth().toString().padStart(2, '0')}${date
    .getUTCDay()
    .toString()
    .padStart(2, '0')}A: observations of a gamma-ray burst`
}

function useBodyPlaceholder() {
  return dedent(`
    Worf Son of Mogh (Starfleet), Geordi LaForge (Starfleet), Beverly Crusher (Starfleet), Deanna Troi (Starfleet), Data Soong (Starfleet), Isaac Newton (Cambridge), Stephen Hawking (Cambridge), and Albert Einstein (Institute for Advanced Study) report on behalf of a larger collaboration:

    ...
    `)
}

export default function () {
  const { isAuthenticated, isAuthorized, formattedAuthor } =
    useLoaderData<typeof loader>()
  const [subjectValid, setSubjectValid] = useState<boolean | undefined>()
  const [bodyValid, setBodyValid] = useState<boolean | undefined>()
  const sending = Boolean(useNavigation().formData)
  const valid = subjectValid && bodyValid

  return (
    <>
      <h1>New GCN Circular</h1>
      <Form method="post" action="/circulars">
        <div className="usa-input-group border-0 maxw-full">
          <div className="usa-input-prefix" aria-hidden>
            From
          </div>
          <span className="padding-1">{formattedAuthor}</span>
          <Link
            to="/user"
            title="Adjust how your name and affiliation appear in new GCN Circulars"
          >
            <Button unstyled type="button">
              <Icon.Edit /> Edit
            </Button>
          </Link>
        </div>
        <div
          className={classnames('usa-input-group', 'maxw-full', {
            'usa-input--error': subjectValid === false,
            'usa-input--success': subjectValid,
          })}
        >
          <div className="usa-input-prefix" aria-hidden>
            Subject
          </div>
          <TextInput
            aria-describedby="subjectDescription"
            className="maxw-full"
            name="subject"
            id="subject"
            type="text"
            placeholder={useSubjectPlaceholder()}
            required={true}
            onChange={({ target: { value } }) => {
              setSubjectValid(subjectIsValid(value))
            }}
          />
        </div>
        <div className="text-base margin-bottom-1" id="subjectDescription">
          <small>
            The subject line must start with the name of the transient, which
            must start with one of the{' '}
            <Link to="/circulars#submission-process">known keywords</Link>. (
            <a href="https://heasarc.gsfc.nasa.gov/cgi-bin/Feedback?selected=kafkagcn">
              Contact us
            </a>{' '}
            to add new keywords.)
          </small>
        </div>
        <label hidden htmlFor="body">
          Body
        </label>
        <Textarea
          name="body"
          id="body"
          aria-describedby="bodyDescription"
          placeholder={useBodyPlaceholder()}
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
            <Link to="/docs/styleguide">style guide</Link>.
          </small>
        </div>
        <ButtonGroup>
          <Link to="/circulars" className="usa-button usa-button--outline">
            Back
          </Link>
          <Button disabled={sending || !valid} type="submit">
            Send
          </Button>
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
        <Link to="/circulars">
          <Button type="button" outline>
            Cancel
          </Button>
        </Link>
        {isAuthenticated ? <PeerEndorsementButton /> : <SignInButton />}
      </ModalFooter>
    </Modal>
  )
}
