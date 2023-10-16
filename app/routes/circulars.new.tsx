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
  Table,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import { type ReactNode, useContext, useState } from 'react'
import { dedent } from 'ts-dedent'

import { getUser } from './_auth/user.server'
import { AstroDataContext } from './circulars.$circularId/AstroDataContext'
import { MarkdownBody, PlainTextBody } from './circulars.$circularId/Body'
import {
  bodyIsValid,
  formatAuthor,
  subjectIsValid,
} from './circulars/circulars.lib'
import { group } from './circulars/circulars.server'
import { CircularsKeywords } from '~/components/CircularsKeywords'
import Spinner from '~/components/Spinner'
import { origin } from '~/lib/env.server'
import { getCanonicalUrlHeaders, pickHeaders } from '~/lib/headers.server'
import { useSearchString } from '~/lib/utils'
import { useUrl } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb: 'New',
}

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  let isAuthenticated, isAuthorized, formattedAuthor
  if (user) {
    isAuthenticated = true
    if (user.groups.includes(group)) isAuthorized = true
    formattedAuthor = formatAuthor(user)
  }
  return json(
    { isAuthenticated, isAuthorized, formattedAuthor },
    { headers: getCanonicalUrlHeaders(new URL(`/circulars/new`, origin)) }
  )
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

function ToggleButton<T extends Record<string, ReactNode>>({
  defaultValue,
  options,
  onChange,
}: {
  defaultValue: keyof T
  options: T
  onChange?: (value: keyof T) => void
}) {
  const [value, setValue] = useState(defaultValue)

  return (
    <ButtonGroup type="segmented">
      {Object.entries(options).map(([key, label]) => (
        <Button
          key={key}
          type="button"
          outline={key !== value}
          onClick={() => {
            setValue(key)
            if (onChange && key !== value) onChange(key)
          }}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  )
}

function useStateToggle(value: boolean) {
  const [state, setState] = useState(value)

  function toggle() {
    setState((state) => !state)
  }

  return [state, toggle] as const
}

export default function () {
  const { isAuthenticated, isAuthorized, formattedAuthor } =
    useLoaderData<typeof loader>()

  // Get default subject from search params, then strip out
  let [searchParams] = useSearchParams()
  const defaultSubject = searchParams.get('subject') || ''
  const defaultBody = searchParams.get('body') || ''
  searchParams = new URLSearchParams(searchParams)
  searchParams.delete('subject')
  searchParams.delete('body')
  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  const [subjectValid, setSubjectValid] = useState(
    subjectIsValid(defaultSubject)
  )
  const [body, setBody] = useState(defaultBody)
  const bodyValid = bodyIsValid(body)
  const [showKeywords, toggleShowKeywords] = useStateToggle(false)
  const [showBodySyntax, toggleShowBodySyntax] = useStateToggle(false)
  const [showPreview, setShowPreview] = useState(false)
  const sending = Boolean(useNavigation().formData)
  const valid = subjectValid && bodyValid

  return (
    <AstroDataContext.Provider value={{ rel: 'noopener', target: '_blank' }}>
      <h1>New GCN Circular</h1>
      <Form method="POST" action={`/circulars${searchString}`}>
        <InputGroup className="border-0 maxw-full">
          <InputPrefix>From</InputPrefix>
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
        <ToggleButton
          defaultValue="edit"
          options={{ edit: 'Edit', preview: 'Preview' }}
          onChange={(value) => {
            setShowPreview(value === 'preview')
          }}
        />
        <Textarea
          hidden={showPreview}
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
            setBody(value)
          }}
        />
        {showPreview && (
          <PlainTextBody className="border padding-1 margin-top-1">
            {body}
          </PlainTextBody>
        )}
        <div className="text-base margin-bottom-1" id="bodyDescription">
          <small>
            Body text. If this is your first Circular, please review the{' '}
            <Link to="/docs/circulars/styleguide">style guide</Link>. References
            to Circulars, DOIs, arXiv preprints, and transients are
            automatically shown as links; see{' '}
            <button
              type="button"
              className="usa-banner__button margin-left-0"
              aria-expanded={showBodySyntax}
              onClick={toggleShowBodySyntax}
            >
              <span className="usa-banner__button-text">syntax.</span>
            </button>
          </small>
        </div>
        {showBodySyntax && (
          <div className="text-base padding-x-2 padding-bottom-2">
            <SyntaxReference />
          </div>
        )}
        <ButtonGroup>
          <Link
            to={`/circulars${searchString}`}
            className="usa-button usa-button--outline"
          >
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
    </AstroDataContext.Provider>
  )
}

function PeerEndorsementButton() {
  return (
    <Link to="/user/endorsements">
      <Button type="button">Get a peer endorsement</Button>
    </Link>
  )
}

function SyntaxExample({
  label,
  children,
  href,
  ...props
}: {
  label: ReactNode
  children: string
} & Pick<JSX.IntrinsicElements['a'], 'href' | 'rel'>) {
  const { target, rel } = useContext(AstroDataContext)
  return (
    <tr>
      <td>
        {href ? (
          <a href={href} {...props} target={target} rel={rel}>
            {label}
          </a>
        ) : (
          label
        )}
      </td>
      <td>
        <code>{children}</code>
      </td>
      <td>
        <MarkdownBody>{children}</MarkdownBody>
      </td>
    </tr>
  )
}

function SyntaxReference() {
  return (
    <>
      <h3>GCN Circulars cross-reference syntax</h3>
      <Table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Example</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          <SyntaxExample label="GCN Circulars" href="/circulars">
            GCN 34653, 34660, and 34677
          </SyntaxExample>
          <SyntaxExample label="DOI" href="https://www.doi.org" rel="external">
            doi:10.1103/PhysRevLett.116.061102
          </SyntaxExample>
          <SyntaxExample label="arXiv" href="https://arxiv.org" rel="external">
            arXiv:1602.03837
          </SyntaxExample>
          <SyntaxExample
            label="TNS"
            href="https://www.wis-tns.org"
            rel="external"
          >
            AT2017gfo
          </SyntaxExample>
          <SyntaxExample label="Web address">
            https://www.swift.psu.edu
          </SyntaxExample>
        </tbody>
      </Table>
    </>
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
