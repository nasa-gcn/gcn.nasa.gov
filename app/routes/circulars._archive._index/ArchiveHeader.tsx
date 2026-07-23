/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Form, Link, useSearchParams, useSubmit } from '@remix-run/react'
import {
  Alert,
  Button,
  ButtonGroup,
  ErrorMessage,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { clamp } from 'lodash'
import { useState } from 'react'

import { DateSelector } from './DateSelectorMenu'
import { LuceneAccordion } from './LuceneMenu'
import { SortSelector } from './SortSelectorButton'
import Hint from '~/components/Hint'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { usePermissionModerator } from '~/root'

import searchImg from 'nasawds/src/img/usa-icons-bg/search--white.svg'

const CircularsHeaderText = () => {
  return (
    <>
      <h1>GCN Circulars</h1>
      <p className="usa-paragraph">
        <b>
          GCN Circulars are rapid astronomical bulletins submitted by and
          distributed to community members worldwide.
        </b>{' '}
        They are used to share discoveries, observations, quantitative near-term
        predictions, requests for follow-up observations, or future observing
        plans related to high-energy, multi-messenger, and variable or transient
        astrophysical events. See the{' '}
        <Link className="usa-link" to="/docs/circulars">
          documentation
        </Link>{' '}
        for help with subscribing to or submitting Circulars.
      </p>
    </>
  )
}

type ArchiveHeaderProps = {
  children: React.ReactNode
  result?: any
  requestedChangeCount?: number
  formId: string
  queryFallback?: boolean
}
export default function ArchiveHeader({
  children,
  result,
  requestedChangeCount = 0,
  formId,
  queryFallback,
}: ArchiveHeaderProps) {
  const submit = useSubmit()
  const [searchParams] = useSearchParams()
  const userIsModerator = usePermissionModerator()

  // Strip off the ?index param if we navigated here from a form.
  // See https://remix.run/docs/en/main/guides/index-query-param.
  searchParams.delete('index')

  const query = searchParams.get('query') || ''
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const sort = searchParams.get('sort') || 'circularID'
  const view = searchParams.get('view') || 'index'
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)
  const isGroupView = view === 'group'

  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  const [inputQuery, setInputQuery] = useState(query)
  const clean = inputQuery === query
  const searchText = isGroupView ? 'Event Name' : 'Search'

  function getSelection(selectionOption: string) {
    return selectionOption === view
      ? 'usa-button padding-y-1'
      : 'usa-button usa-button--outline padding-y-1'
  }

  return (
    <>
      {result?.intent === 'correction' && (
        <Alert
          type="success"
          headingLevel="h1"
          slim
          heading="Request Submitted"
        >
          Thank you for your correction. A GCN Circulars moderator will review
          it shortly.
        </Alert>
      )}

      <CircularsHeaderText />

      {userIsModerator && requestedChangeCount > 0 && (
        <Link to="moderation" className="usa-button usa-button--outline">
          Review {requestedChangeCount} Requested Change
          {requestedChangeCount > 1 ? 's' : ''}
        </Link>
      )}
      {userIsModerator && (
        <Link to="/synonyms" className="usa-button usa-button--outline">
          Synonym Moderation
        </Link>
      )}

      <ToolbarButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1 z-300">
        <Form
          preventScrollReset
          className="display-inline-block usa-search usa-search--small"
          role="search"
          id={formId}
        >
          <Label srOnly htmlFor="query">
            Search
          </Label>
          <input type="hidden" name="view" value={view} />
          <TextInput
            autoFocus
            className="minw-15"
            id="query"
            name="query"
            type="search"
            defaultValue={inputQuery}
            placeholder={searchText}
            aria-describedby="searchHint"
            onChange={({ target: { form, value } }) => {
              setInputQuery(value)
              if (!value) submit(form, { preventScrollReset: true })
            }}
          />
          <Button type="submit">
            <img
              src={searchImg}
              className="usa-search__submit-icon"
              alt="Search"
            />
          </Button>
        </Form>

        <ButtonGroup type="segmented">
          <Link
            to={`/circulars?view=index&limit=${limit}`}
            preventScrollReset
            className={getSelection('index')}
          >
            <Icon.List role="presentation" />
            Circulars
          </Link>
          <Link
            to={`/circulars?view=group&limit=${limit}`}
            preventScrollReset
            className={getSelection('group')}
          >
            <Icon.ContentCopy role="presentation" />
            Events
          </Link>
        </ButtonGroup>

        <Link to={`/circulars/new${searchString}`}>
          <Button type="button" className="padding-y-1">
            <Icon.Edit role="presentation" /> New
          </Button>
        </Link>
        {!isGroupView && (
          <DateSelector
            form={formId}
            defaultStartDate={startDate}
            defaultEndDate={endDate}
          />
        )}

        {query && !isGroupView && (
          <SortSelector form={formId} defaultValue={sort} />
        )}
      </ToolbarButtonGroup>
      {queryFallback && (
        <ErrorMessage>
          "{query}" does not adhere to advanced search syntax. Please refer to
          the{' '}
          <Link
            className="usa-link"
            to="/docs/circulars/archive#advanced-search"
          >
            documentation
          </Link>{' '}
          and try again.
        </ErrorMessage>
      )}
      <Hint id="searchHint">
        {isGroupView ? (
          <>
            Search for Event Groups by event name (e.g. 'GRB 123456A',
            'GRB123456A', '123456A'). <br />
          </>
        ) : (
          <>
            Search for Circulars by submitter, subject, or body text (e.g.
            'Fermi GRB'). <br />
            To navigate to a specific circular, enter the associated Circular ID
            (e.g. 'gcn123', 'Circular 123', or '123').
          </>
        )}
      </Hint>

      {!isGroupView && <LuceneAccordion />}
      {clean && children}
    </>
  )
}
