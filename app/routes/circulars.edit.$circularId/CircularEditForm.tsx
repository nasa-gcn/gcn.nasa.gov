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
  DatePicker,
  Grid,
  Icon,
  InputGroup,
  InputPrefix,
  Table,
  TextInput,
  TimePicker,
} from '@trussworks/react-uswds'
import classnames from 'classnames'
import { type ReactNode, useContext, useState } from 'react'
import { dedent } from 'ts-dedent'

import { AstroDataContext } from '../circulars.$circularId.($version)/AstroDataContext'
import { MarkdownBody } from '../circulars.$circularId.($version)/Body'
import {
  type CircularFormat,
  bodyIsValid,
  dateIsValid,
  subjectIsValid,
  submitterIsValid,
} from '../circulars/circulars.lib'
import { RichEditor } from './RichEditor'
import { CircularsKeywords } from '~/components/CircularsKeywords'
import CollapsableInfo from '~/components/CollapsableInfo'
import Spinner from '~/components/Spinner'
import { useModStatus } from '~/root'

import styles from './CircularsEditForm.module.css'

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
  defaultCreatedOnDate,
  defaultCreatedOnTime,
  intent,
}: {
  formattedContributor: string
  circularId?: number
  defaultSubmitter?: string
  defaultFormat?: CircularFormat
  defaultBody: string
  defaultSubject: string
  searchString: string
  defaultCreatedOnDate?: string
  defaultCreatedOnTime?: string
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
  const [subject, setSubject] = useState(defaultSubject)
  const [format, setFormat] = useState(defaultFormat)
  const [date, setDate] = useState(defaultCreatedOnDate)
  const [time, setTime] = useState(defaultCreatedOnTime ?? '12:00')
  const dateValid = circularId ? dateIsValid(date, time) : true

  const [submitter, setSubmitter] = useState(defaultSubmitter)
  const submitterValid = circularId ? submitterIsValid(submitter) : true
  const bodyValid = bodyIsValid(body)
  const sending = Boolean(useNavigation().formData)
  const valid = subjectValid && bodyValid && dateValid && submitterValid
  let headerText, saveButtonText

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
  const bodyPlaceholder = useBodyPlaceholder()
  const changesHaveBeenMade =
    body.trim() !== defaultBody.trim() ||
    subject.trim() !== defaultSubject.trim() ||
    format !== defaultFormat ||
    submitter?.trim() !== defaultSubmitter ||
    date !== defaultCreatedOnDate ||
    time !== defaultCreatedOnTime

  const userIsModerator = useModStatus()

  return (
    <AstroDataContext.Provider value={{ rel: 'noopener', target: '_blank' }}>
      <h1>{headerText} GCN Circular</h1>
      {intent === 'correction' && (
        <p className="usa-paragraph">
          See{' '}
          <Link to="/docs/circulars/corrections">
            documentation on Circulars moderation
          </Link>{' '}
          for more information on corrections.
        </p>
      )}
      <Form method="POST" action={`/circulars${formSearchString}`}>
        <input type="hidden" name="intent" value={intent} />
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
        <InputGroup className="border-0 maxw-full">
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
        {circularId !== undefined && (
          <Grid row gap="md">
            <Grid tablet={{ col: 'auto' }}>
              <InputGroup
                className={classnames({
                  'usa-input--error': !date || !Date.parse(date),
                  'usa-input--success': date && Date.parse(date),
                })}
              >
                <InputPrefix className="wide-input-prefix">Date</InputPrefix>
                <DatePicker
                  defaultValue={defaultCreatedOnDate}
                  className={classnames(
                    styles.DatePicker,
                    'border-0 flex-fill'
                  )}
                  onChange={(value) => {
                    setDate(value ?? '')
                  }}
                  name="createdOnDate"
                  id="createdOnDate"
                  dateFormat="YYYY-MM-DD"
                />
              </InputGroup>
            </Grid>
            <Grid tablet={{ col: 'auto' }}>
              <InputGroup
                className={classnames({
                  'usa-input--error': !time,
                  'usa-input--success': time,
                })}
              >
                {/* FIXME: The TimePicker component does not by itself 
                contribute useful form data because only the element has 
                a name, and the field does not. So the form data is only 
                populated correctly if the user selects an option from the 
                dropdown, but not if they type a valid value into the combo box.
                
                See https://github.com/trussworks/react-uswds/issues/2806 */}
                <input
                  type="hidden"
                  id="createdOnTime"
                  name="createdOnTime"
                  value={time}
                />
                <InputPrefix className="wide-input-prefix">Time</InputPrefix>
                {/* FIXME: Currently only 12 hour formats are supported. We should
                switch to 24 hours as it is more common/useful for the community.
                
                See https://github.com/trussworks/react-uswds/issues/2947 */}
                <TimePicker
                  id="createdOnTimeSetter"
                  name="createdOnTimeSetter"
                  defaultValue={defaultCreatedOnTime}
                  className={classnames(styles.TimePicker, 'margin-top-neg-3')}
                  onChange={(value) => {
                    setTime(value ?? '')
                  }}
                  step={1}
                  label=""
                />
              </InputGroup>
            </Grid>
          </Grid>
        )}
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
              setSubjectValid(subjectIsValid(value))
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
          <Button
            disabled={sending || !valid || !changesHaveBeenMade}
            type="submit"
            value="save"
          >
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
