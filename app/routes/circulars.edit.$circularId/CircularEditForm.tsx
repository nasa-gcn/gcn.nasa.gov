/*!
 * Copyright © 2023 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Form, Link, useNavigation } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Icon,
  InputGroup,
  InputPrefix,
  Table,
  TextInput,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import { type ReactNode, useContext, useState } from 'react'
import { dedent } from 'ts-dedent'

import {
  type CircularFormat,
  bodyIsValid,
  parseEventFromSubject,
  subjectIsValid,
  submitterIsValid,
} from '../circulars/circulars.lib'
import { RichEditor } from './RichEditor'
import { CircularsKeywords } from '~/components/CircularsKeywords'
import CollapsableInfo from '~/components/CollapsableInfo'
import Spinner from '~/components/Spinner'
import { AstroDataContext } from '~/components/circularDisplay/AstroDataContext'
import { MarkdownBody } from '~/components/circularDisplay/Body'
import { usePermissionModerator } from '~/root'

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

export function SyntaxReference() {
  return (
    <>
      <h3>GCN Circulars cross-reference syntax</h3>
      <Table compact bordered>
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

export function CircularEditForm({
  formattedContributor,
  circularId,
  defaultSubmitter,
  defaultFormat,
  defaultBody,
  defaultSubject,
  searchString,
  defaultEventId: originalEventId,
}: {
  formattedContributor: string
  circularId?: number
  defaultSubmitter?: string
  defaultFormat?: CircularFormat
  defaultBody: string
  defaultSubject: string
  searchString: string
  defaultEventId?: string
}) {
  let formSearchString = '?index'
  if (searchString) {
    formSearchString = `${formSearchString}&${searchString}`
    searchString = `?${searchString}`
  }
  const [body, setBody] = useState(defaultBody)
  const [subject, setSubject] = useState(defaultSubject)
  const [format, setFormat] = useState(defaultFormat)
  const [submitter, setSubmitter] = useState(defaultSubmitter)
  const subjectValid = subjectIsValid(subject)
  const derivedEventId = parseEventFromSubject(subject)
  const [linkEventId, setLinkEventId] = useState(
    originalEventId === derivedEventId
  )
  const [defaultEventId, setDefaultEventId] = useState(
    originalEventId || derivedEventId
  )
  const [eventId, setEventId] = useState(defaultEventId)
  const submitterValid = circularId ? submitterIsValid(submitter) : true
  const bodyValid = bodyIsValid(body)
  const sending = Boolean(useNavigation().formData)
  const valid = subjectValid && bodyValid && submitterValid

  const bodyPlaceholder = useBodyPlaceholder()
  const changesHaveBeenMade =
    body.trim() !== defaultBody.trim() ||
    subject.trim() !== defaultSubject.trim() ||
    format !== defaultFormat ||
    submitter?.trim() !== defaultSubmitter ||
    eventId?.trim() !== originalEventId

  const userIsModerator = usePermissionModerator()

  const submitDisabled = sending || !valid || !changesHaveBeenMade

  return (
    <AstroDataContext.Provider value={{ rel: 'noopener', target: '_blank' }}>
      <Form method="POST" action={`/circulars${formSearchString}`}>
        <input type="hidden" name="circularId" value={circularId} />
        {circularId !== undefined && userIsModerator && (
          <>
            <InputGroup
              className={classnames('maxw-full', {
                'usa-input--error': !submitterValid,
                'usa-input--success': submitterValid,
              })}
            >
              <InputPrefix className="wide-input-prefix">From</InputPrefix>
              <TextInput
                className="maxw-full"
                name="submitter"
                id="submitter"
                type="text"
                defaultValue={defaultSubmitter}
                onChange={(event) => setSubmitter(event.target.value)}
                required
              />
            </InputGroup>
          </>
        )}
        <InputGroup className="maxw-full usa-input---not-editable">
          <InputPrefix className="wide-input-prefix">
            {circularId === undefined ? 'From' : 'Editor'}
          </InputPrefix>
          <span className="padding-1">{formattedContributor} </span>
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
          <InputPrefix className="wide-input-prefix">Subject</InputPrefix>
          <TextInput
            autoFocus
            aria-describedby="subjectDescription"
            className="maxw-full"
            name="subject"
            id="subject"
            type="text"
            placeholder={useSubjectPlaceholder()}
            defaultValue={defaultSubject}
            required
            onChange={({ target: { value } }) => {
              setSubject(value)
              setDefaultEventId(parseEventFromSubject(value))
            }}
          />
        </InputGroup>
        <CollapsableInfo
          id="subjectDescription"
          preambleText="The subject line must contain (and should start with) the name of the transient, which must start with one of the"
          buttonText="known keywords"
        >
          <CircularsKeywords />
        </CollapsableInfo>
        {circularId !== undefined && (
          <>
            {linkEventId ? (
              <InputGroup className="maxw-full usa-input---not-editable">
                <InputPrefix className="wide-input-prefix">
                  Event ID
                </InputPrefix>
                <span className="padding-1">{derivedEventId}</span>
                <input type="hidden" name="eventId" value={eventId} />
              </InputGroup>
            ) : (
              <InputGroup className="maxw-full">
                <InputPrefix className="wide-input-prefix">
                  Event ID
                </InputPrefix>
                <TextInput
                  className="maxw-full"
                  defaultValue={defaultEventId}
                  name="eventId"
                  id="eventId"
                  type="text"
                  onChange={({ target: { value } }) => {
                    setEventId(value)
                  }}
                />
              </InputGroup>
            )}
            <Checkbox
              id="autofill-eventId"
              name="autofill-eventId"
              className="margin-bottom-2"
              label={
                <>
                  Automatically fill event ID from subject
                  {eventId !== derivedEventId &&
                    '. The event ID does not match.'}
                </>
              }
              checked={linkEventId}
              onChange={({ target: { checked } }) => {
                setLinkEventId(checked)
                setDefaultEventId(derivedEventId)
                setEventId(derivedEventId)
              }}
            />
          </>
        )}
        <label hidden htmlFor="body">
          Body
        </label>
        <RichEditor
          aria-describedby="bodyDescription"
          placeholder={bodyPlaceholder}
          defaultValue={defaultBody}
          defaultMarkdown={defaultFormat === 'text/markdown'}
          required
          className={bodyValid ? 'usa-input--success' : undefined}
          onChange={({ target: { value } }) => {
            setBody(value)
          }}
          markdownStateSetter={setFormat}
        />
        <CollapsableInfo
          id="bodyDescription"
          preambleText={
            <>
              Body text. If this is your first Circular, please review the{' '}
              <Link to="/docs/circulars/styleguide">style guide</Link>.
              References to Circulars, DOIs, arXiv preprints, and transients are
              automatically shown as links; see
            </>
          }
          buttonText="syntax"
        >
          <SyntaxReference />
        </CollapsableInfo>
        <ButtonGroup>
          <Link
            to={`/circulars${searchString}`}
            className="usa-button usa-button--outline"
          >
            Back
          </Link>
          {circularId === undefined ? (
            <Button
              disabled={submitDisabled}
              type="submit"
              name="intent"
              value="new"
            >
              Send
            </Button>
          ) : (
            <Button
              disabled={submitDisabled}
              type="submit"
              name="intent"
              value="correction"
            >
              Request Correction
            </Button>
          )}
          {circularId !== undefined && userIsModerator && (
            <Button
              secondary
              disabled={submitDisabled}
              type="submit"
              name="intent"
              value="edit"
            >
              Save as New Version
            </Button>
          )}
          {sending && (
            <div className="padding-top-1 padding-bottom-1">
              <Spinner /> Sending...
            </div>
          )}
        </ButtonGroup>
      </Form>
    </AstroDataContext.Provider>
  )
}

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
