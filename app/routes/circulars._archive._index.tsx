/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  DateRangePicker,
  Icon,
  Label,
  Radio,
  Select,
  TextInput,
} from '@trussworks/react-uswds'
import classNames from 'classnames'
import clamp from 'lodash/clamp'
import { useState } from 'react'

import { circularRedirect, search } from './circulars/circulars.server'
import type { action } from './circulars/route'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import Hint from '~/components/Hint'
import { usePagination } from '~/lib/pagination'
import { useFeature } from '~/root'

import searchImg from 'nasawds/src/img/usa-icons-bg/search--white.svg'

export async function loader({ request: { url } }: DataFunctionArgs) {
  const { searchParams } = new URL(url)
  const query = searchParams.get('query') || undefined
  if (query) {
    await circularRedirect(query)
  }
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)
  const results = await search({
    query,
    page: page - 1,
    limit,
    startDate,
    endDate,
  })

  return { page, ...results }
}

function getPageLink({
  page,
  limit,
  query,
  startDate,
  endDate,
}: {
  page: number
  limit?: number
  query?: string
  startDate?: string
  endDate?: string
}) {
  const searchParams = new URLSearchParams()
  if (page > 1) searchParams.set('page', page.toString())
  if (limit && limit != 100) searchParams.set('limit', limit.toString())
  if (query) searchParams.set('query', query)
  if (startDate) searchParams.set('startDate', startDate)
  if (endDate) searchParams.set('endDate', endDate)

  const searchString = searchParams.toString()
  return searchString && `?${searchString}`
}

function Pagination({
  page,
  totalPages,
  ...queryStringProps
}: {
  page: number
  totalPages: number
  limit?: number
  query?: string
  startDate?: string
  endDate?: string
}) {
  const pages = usePagination({ currentPage: page, totalPages })

  return (
    <nav aria-label="Pagination" className="usa-pagination">
      <ul className="usa-pagination__list">
        {pages.map((pageProps, i) => {
          switch (pageProps.type) {
            case 'prev':
              return (
                <li
                  className="usa-pagination__item usa-pagination__arrow"
                  key={i}
                >
                  <Link
                    to={getPageLink({
                      page: pageProps.number,
                      ...queryStringProps,
                    })}
                    className="usa-pagination__link usa-pagination__previous-page"
                    aria-label="Previous page"
                  >
                    <Icon.NavigateBefore role="presentation" />
                    <span className="usa-pagination__link-text">Previous</span>
                  </Link>
                </li>
              )
            case 'overflow':
              return (
                <li
                  className="usa-pagination__item usa-pagination__overflow"
                  role="presentation"
                  key={i}
                >
                  <span>…</span>
                </li>
              )
            case 'next':
              return (
                <li
                  className="usa-pagination__item usa-pagination__arrow"
                  key={i}
                >
                  <Link
                    to={getPageLink({
                      page: pageProps.number,
                      ...queryStringProps,
                    })}
                    className="usa-pagination__link usa-pagination__next-page"
                    aria-label="Next page"
                  >
                    <Icon.NavigateNext role="presentation" />
                    <span className="usa-pagination__link-text">Next</span>
                  </Link>
                </li>
              )
            default:
              return (
                <li
                  className="usa-pagination__item usa-pagination__page-no"
                  key={i}
                >
                  <Link
                    to={getPageLink({
                      page: pageProps.number,
                      ...queryStringProps,
                    })}
                    className={classNames('usa-pagination__button', {
                      'usa-current': pageProps.isCurrent,
                    })}
                    prefetch="render"
                    aria-label={`Page ${pageProps.number}`}
                    aria-current={pageProps.isCurrent}
                  >
                    {pageProps.number}
                  </Link>
                </li>
              )
          }
        })}
      </ul>
    </nav>
  )
}

const dateSelectorLabels: Record<string, string> = {
  hour: 'Last hour',
  day: 'Last day',
  week: 'Last week',
  month: 'Last month',
  year: 'Last year',
  today: 'Today',
  mtd: 'Month to date',
  ytd: 'Year to date',
}

function DateSelectorButton({
  startDate,
  endDate,
  expanded,
  ...props
}: {
  startDate?: string
  endDate?: string
  expanded?: boolean
} & Omit<Parameters<typeof ButtonGroup>[0], 'segmented' | 'children'>) {
  const slimClasses = 'height-4 padding-y-0'

  return (
    <ButtonGroup type="segmented" {...props}>
      <Button type="button" className={`${slimClasses} padding-x-2`}>
        {(startDate && dateSelectorLabels[startDate]) ||
          (startDate && endDate && (
            <>
              {startDate}—{endDate}
            </>
          )) ||
          'Filter by date'}
      </Button>
      <Button type="button" className={`${slimClasses} padding-x-1`}>
        <Icon.CalendarToday role="presentation" />
        {expanded ? (
          <Icon.ExpandLess role="presentation" />
        ) : (
          <Icon.ExpandMore role="presentation" />
        )}
      </Button>
    </ButtonGroup>
  )
}

export default function () {
  const newItem = useActionData<typeof action>()
  const { items, page, totalPages, totalItems } = useLoaderData<typeof loader>()
  const featureCircularsFilterByDate = useFeature('CIRCULARS_FILTER_BY_DATE')

  // Concatenate items from the action and loader functions
  const allItems = [...(newItem ? [newItem] : []), ...(items || [])]

  const [searchParams] = useSearchParams()
  const limit = searchParams.get('limit') || '100'
  const query = searchParams.get('query') || undefined
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined

  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  const [inputQuery, setInputQuery] = useState(query)
  const [inputDateGte, setInputDateGte] = useState(startDate)
  const [inputDateLte, setInputDateLte] = useState(endDate)
  const [showContent, setShowContent] = useState(false) // for the custom date range dropdown
  const [showDateRange, setShowDateRange] = useState(false)
  const clean =
    inputQuery === query &&
    inputDateGte === startDate &&
    inputDateLte === endDate

  const submit = useSubmit()

  const setFuzzyTime = (startDate?: string) => {
    if (startDate === 'custom') {
      setShowDateRange(true)
    } else {
      setShowDateRange(false)
      setInputDateGte(startDate)
    }
    setInputDateLte('now')
  }

  const setDateRange = () => {
    // setShowContent(false)
    if (showDateRange) setShowDateRange(false)
    const params = new URLSearchParams(location.search)
    if (inputDateGte) params.set('startDate', inputDateGte)
    if (inputDateLte) params.set('endDate', inputDateLte)
    submit(params, {
      method: 'get',
      action: '/circulars',
    })
  }

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
      <ButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1 z-top">
        <Form
          className="display-inline-block usa-search usa-search--small"
          role="search"
          id="searchForm"
        >
          <Label srOnly={true} htmlFor="query">
            Search
          </Label>
          <TextInput
            autoFocus
            id="query"
            name="query"
            type="search"
            defaultValue={inputQuery}
            placeholder="Search"
            aria-describedby="searchHint"
            onChange={({ target: { form, value } }) => {
              setInputQuery(value)
              if (!value) submit(form)
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
        {featureCircularsFilterByDate && (
          <>
            <DateSelectorButton
              startDate={startDate}
              endDate={endDate}
              onClick={() => { setShowContent((shown) => !shown) }}
              expanded={showContent}
            />
            {showContent && (
              <DetailsDropdownContent className="margin-top-1">
                <div className="usa-radio maxw-card-xlg">
                  <div className="display-flex flex-row">
                    <div className="display-flex flex-column flex-align-start margin-1">
                      <Radio
                        id="radio-alltime"
                        name="radio-date"
                        value="undefined"
                        defaultChecked={true}
                        label="All Time"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                      <Radio
                        id="radio-hour"
                        name="radio-date"
                        value="hour"
                        label="Past hour"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                      <Radio
                        id="radio-today"
                        name="radio-date"
                        value="today"
                        label="Today"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                    </div>
                    <div className="display-flex flex-column margin-1">
                      <Radio
                        id="radio-day"
                        name="radio-date"
                        value="day"
                        label="Past 24 Hours"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                      <Radio
                        id="radio-week"
                        name="radio-date"
                        value="week"
                        label="Past Week"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                      <Radio
                        id="radio-month"
                        name="radio-date"
                        value="month"
                        label="Past Month"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                    </div>

                    <div className="display-flex flex-column margin-1">
                      <Radio
                        id="radio-year"
                        name="radio-date"
                        value="year"
                        label="Past Year"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                      <Radio
                        id="radio-ytd"
                        name="radio-date"
                        value="ytd"
                        label="Year to Date"
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setFuzzyTime(e.target.value)
                        }}
                      />
                      <Radio
                        id="radio-custom"
                        name="radio-date"
                        value="custom"
                        label="Custom Range..."
                        className="usa-search__filter-button"
                        onChange={(e) => {
                          setShowDateRange(e.target.checked)
                        }}
                      />
                    </div>
                  </div>

                  {showDateRange && (
                    <DateRangePicker
                      startDateHint="dd/mm/yyyy"
                      startDateLabel="Start Date"
                      className="margin-bottom-2"
                      startDatePickerProps={{
                        id: 'event-date-start',
                        name: 'event-date-start',
                        defaultValue: 'startDate',
                        onChange: (value) => {
                          setInputDateGte(value)
                        },
                        // style: { height: '15px' }, // Adjust the height as needed
                      }}
                      endDateHint="dd/mm/yyyy"
                      endDateLabel="End Date"
                      endDatePickerProps={{
                        id: 'event-date-end',
                        name: 'event-date-end',
                        defaultValue: 'endDate',
                        onChange: (value) => {
                          setInputDateLte(value)
                        },
                        // style: { height: '15px' },
                      }}
                    />
                  )}
                  <div className="display-flex flex-row">
                    <Button
                      type="button"
                      className=""
                      form="searchForm"
                      onClick={() => {
                        setDateRange()
                      }}
                    >
                      <Icon.CalendarToday /> Submit
                    </Button>
                  </div>
                </div>
              </DetailsDropdownContent>
            )}
          </>
        )}
        <Link to={`/circulars/new${searchString}`}>
          <Button
            type="button"
            className="height-4 padding-top-0 padding-bottom-0"
          >
            <Icon.Edit role="presentation" /> New
          </Button>
        </Link>
      </ButtonGroup>
      <Hint id="searchHint">
        Search for Circulars by submitter, subject, or body text (e.g. 'Fermi
        GRB'). <br />
        To navigate to a specific circular, enter the associated Circular ID
        (e.g. 'gcn123', 'Circular 123', or '123').
      </Hint>
      {clean && (
        <>
          {query && (
            <h3>
              {totalItems} result{totalItems != 1 && 's'} found.
            </h3>
          )}
          <ol>
            {allItems.map(({ circularId, subject }) => (
              <li key={circularId} value={circularId}>
                <Link
                  className="usa-link"
                  to={`/circulars/${circularId}${searchString}`}
                >
                  {subject}
                </Link>
              </li>
            ))}
          </ol>
          <div className="display-flex flex-row flex-wrap">
            <div className="display-flex flex-align-self-center margin-right-2 width-auto">
              <div>
                <Select
                  id="limit"
                  className="width-auto height-5 padding-y-0 margin-y-0"
                  name="limit"
                  defaultValue="100"
                  form="searchForm"
                  onChange={({ target: { form } }) => {
                    submit(form)
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="20">20 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </Select>
              </div>
            </div>
            <div className="display-flex flex-fill">
              {totalPages > 1 && (
                <Pagination
                  query={query}
                  page={page}
                  limit={parseInt(limit)}
                  totalPages={totalPages}
                  startDate={startDate}
                  endDate={endDate}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
