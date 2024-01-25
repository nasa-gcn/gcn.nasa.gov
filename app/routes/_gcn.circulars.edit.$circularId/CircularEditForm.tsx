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
  Icon,
  InputGroup,
  InputPrefix,
  Table,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import type { ReactNode } from 'react'
import { useContext, useState } from 'react'
import { dedent } from 'ts-dedent'

import { AstroDataContext } from '../_gcn.circulars.$circularId.($version)/AstroDataContext'
import {
  MarkdownBody,
  PlainTextBody,
} from '../_gcn.circulars.$circularId.($version)/Body'
import { bodyIsValid, subjectIsValid } from '../_gcn.circulars/circulars.lib'
import {
  SegmentedRadioButton,
  SegmentedRadioButtonGroup,
} from './SegmentedRadioButton'
import { CircularsKeywords } from '~/components/CircularsKeywords'
import Spinner from '~/components/Spinner'

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
  submitter,
  defaultBody,
  defaultSubject,
  searchString,
  intent,
}: {
  formattedContributor: string
  circularId?: number
  submitter?: string
  defaultBody: string
  defaultSubject: string
  searchString: string
  intent: 'correction' | 'edit' | 'new'
}) {
  let formSearchString = '?index'
  if (searchString) {
    formSearchString = `${formSearchString}&${searchString}`
    searchString = `?${searchString}`
  }
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
  let headerText,
    saveButtonText = ''

  switch (intent) {
    case 'correction':
      headerText = 'Correct'
      saveButtonText = 'Submit'
      break
    case 'edit':
      headerText = 'Edit'
      saveButtonText = 'Update'
      break
    case 'new':
      headerText = 'New'
      saveButtonText = 'Send'

      break
  }

  return (
    <AstroDataContext.Provider value={{ rel: 'noopener', target: '_blank' }}>
      <h1>{headerText} GCN Circular</h1>
      <Form method="POST" action={`/circulars${formSearchString}`}>
        <input type="hidden" name="intent" value={intent} />
        {circularId && (
          <>
            <input type="hidden" name="circularId" value={circularId} />
            <InputGroup className="border-0 maxw-full">
              <InputPrefix className="wide-input-prefix">From</InputPrefix>
              <span className="padding-1">{submitter}</span>
            </InputGroup>
          </>
        )}
        <InputGroup className="border-0 maxw-full">
          <InputPrefix className="wide-input-prefix">
            {circularId ? 'Editor' : 'From'}
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
        <SegmentedRadioButtonGroup>
          <SegmentedRadioButton
            defaultChecked
            onClick={() => setShowPreview(false)}
          >
            Edit
          </SegmentedRadioButton>
          <SegmentedRadioButton onClick={() => setShowPreview(true)}>
            Preview
          </SegmentedRadioButton>
        </SegmentedRadioButtonGroup>
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
          <Button disabled={sending || !valid} type="submit" value="save">
            {saveButtonText}
          </Button>
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

function useStateToggle(value: boolean) {
  const [state, setState] = useState(value)

  function toggle() {
    setState((state) => !state)
  }

  return [state, toggle] as const
}
