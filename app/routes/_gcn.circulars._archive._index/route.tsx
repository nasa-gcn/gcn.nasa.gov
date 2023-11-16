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
  CardBody,
  CardFooter,
  DateRangePicker,
  Grid,
  Icon,
  Label,
  Radio,
  Select,
  TextInput,
} from '@trussworks/react-uswds'
import clamp from 'lodash/clamp'
import { useState } from 'react'

import type { FilteredMetadata } from '../_gcn.circulars/circulars.lib'
import {
  circularRedirect,
  getCircularsByEventIds,
  groupCircularsBySynonyms,
  search,
} from '../_gcn.circulars/circulars.server'
import type { action } from '../_gcn.circulars/route'
import { getSynonyms } from '../_gcn.synonyms/synonyms.server'
import CircularPagination from './CircularPagination'
import CircularsHeader from './CircularsHeader'
import CircularsIndex from './CircularsIndex'
import DateSelectorButton from './DateSelectorButton'
import GroupedView from './GroupedView'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import Hint from '~/components/Hint'
import { useFeature } from '~/root'

import searchImg from 'nasawds/src/img/usa-icons-bg/search--white.svg'

export async function loader({ request: { url } }: DataFunctionArgs) {
  const { searchParams } = new URL(url)
  const query = searchParams.get('query') || undefined
  if (query) {
    await circularRedirect(query)
  }
  const currentPage = parseInt(searchParams.get('page') || '1')
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)

  const searchResponse = await search({
    query,
    page: currentPage - 1,
    limit,
    startDate,
    endDate,
  })
  const { synonyms, totalItems, totalPages } = await getSynonyms({
    page: currentPage - 1,
    eventId: query,
    limit,
  })
  const eventIds = [] as string[]

  Object.keys(synonyms).forEach((value: string) => {
    synonyms[value].forEach((event) => {
      eventIds.push(event)
    })
  })

  const circulars = await getCircularsByEventIds(eventIds)
  const { groups } = await groupCircularsBySynonyms({ synonyms, circulars })
  const combinedResults: FilteredMetadata = {
    groups: {
      page: currentPage,
      items: groups,
      totalPages: totalPages || 0,
      totalItems: totalItems || 0,
    },
    index: {
      page: currentPage,
      items: searchResponse.items,
      totalPages: searchResponse.totalPages,
      totalItems: searchResponse.totalItems,
    },
  }
  return { ...combinedResults }
}

export default function () {
  const newItem = useActionData<typeof action>()
  const { groups, index } = useLoaderData<typeof loader>()
  const featureSynonyms = useFeature('SYNONYM_GROUPING')
  const featureCircularsFilterByDate = useFeature('CIRCULARS_FILTER_BY_DATE')
  const allItems = [...(newItem ? [newItem] : []), ...(index.items || [])]
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
  const [showContent, setShowContent] = useState(false)
  const [showDateRange, setShowDateRange] = useState(false)
  const [groupsChecked, setGroupsChecked] = useState(false)
  const [circularsChecked, setCircularsChecked] = useState(true)
  const filteredPage = circularsChecked ? index.page : groups.page
  const filteredTotalPages = circularsChecked
    ? index.totalPages
    : groups.totalPages
  const clean = inputQuery === query

  const submit = useSubmit()

  function setFuzzyTime(startDate?: string) {
    setShowDateRange(false)
    setInputDateGte(startDate)
    setInputDateLte('')
  }

  function setDateRange() {
    setShowContent(false)
    if (inputDateGte) searchParams.set('startDate', inputDateGte)
    else searchParams.delete('startDate')
    if (inputDateLte) searchParams.set('endDate', inputDateLte)
    else searchParams.delete('endDate')
    submit(searchParams, {
      method: 'get',
      action: '/circulars',
    })
  }

  const dateSelectorLabels: Record<string, string> = {
    hour: 'Last Hour',
    today: 'Today',
    day: 'Last Day',
    week: 'Last Week',
    month: 'Last Month',
    year: 'Last Year',
    ytd: 'Year to Date',
  }

  return (
    <>
      <CircularsHeader />
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
              onClick={() => {
                setShowContent((shown) => !shown)
                setShowDateRange(false)
              }}
              expanded={showContent}
            />
            {showContent && (
              <DetailsDropdownContent className="maxw-card-xlg">
                <CardBody>
                  <Grid row>
                    <Grid col={4} key={`radio-alltime`}>
                      <Radio
                        id={`radio-alltime`}
                        name="radio-date"
                        value=""
                        label="All Time"
                        defaultChecked={true}
                        onChange={(e) => {
                          setInputDateGte(e.target.value)
                        }}
                      />
                    </Grid>
                    {Object.entries(dateSelectorLabels).map(
                      ([value, label]) => (
                        <Grid col={4} key={`radio-${value}`}>
                          <Radio
                            id={`radio-${value}`}
                            name="radio-date"
                            value={value}
                            label={label}
                            checked={value === inputDateGte}
                            onChange={() => {
                              setFuzzyTime(value)
                            }}
                          />
                        </Grid>
                      )
                    )}
                    <Grid col={4}>
                      <Radio
                        id="radio-custom"
                        name="radio-date"
                        value="custom"
                        label="Custom Range..."
                        checked={showDateRange}
                        onChange={(e) => {
                          setShowDateRange(e.target.checked)
                        }}
                      />
                    </Grid>
                  </Grid>
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
                      }}
                    />
                  )}

                  <CardFooter>
                    <Button
                      type="button"
                      form="searchForm"
                      onClick={() => {
                        setDateRange()
                      }}
                    >
                      <Icon.CalendarToday /> Submit
                    </Button>
                  </CardFooter>
                </CardBody>
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
      {featureSynonyms && (
        <details className="margin-top-1 open">
          <summary className="">Advanced Search Filters</summary>
          <div className="margin-left-3">
            <fieldset className="usa-fieldset">
              <div className="usa-checkbox maxw-card-lg">
                <input
                  className="usa-checkbox__input usa-radio__input--tile"
                  id="circulars"
                  type="checkbox"
                  name="circulars"
                  value={circularsChecked.toString()}
                  checked={circularsChecked}
                  onChange={() => {
                    setGroupsChecked(!groupsChecked)
                    setCircularsChecked(!circularsChecked)
                  }}
                />
                <label className="usa-checkbox__label" htmlFor="circulars">
                  Circulars
                  <span className="usa-checkbox__label-description">
                    View Circulars index.
                  </span>
                </label>
              </div>
              <div className="usa-checkbox maxw-card-lg">
                <input
                  className="usa-checkbox__input usa-checkbox__input--tile"
                  id="groups"
                  type="checkbox"
                  name="groups"
                  value={groupsChecked.toString()}
                  checked={groupsChecked}
                  onChange={() => {
                    setCircularsChecked(!circularsChecked)
                    setGroupsChecked(!groupsChecked)
                  }}
                />
                <label className="usa-checkbox__label" htmlFor="groups">
                  Groups
                  <span className="usa-checkbox__label-description">
                    View Circulars grouped by synonymous events.
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
        </details>
      )}
      {clean && circularsChecked && (
        <CircularsIndex
          allItems={allItems}
          searchString={searchString}
          totalItems={index.totalItems}
          query={query}
        />
      )}
      {clean && groupsChecked && featureSynonyms && (
        <GroupedView
          allItems={groups.items}
          searchString={searchString}
          query={query}
          totalItems={groups.totalItems}
        />
      )}
      {clean && (
        <>
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
              {filteredTotalPages > 1 && (
                <CircularPagination
                  query={query}
                  page={filteredPage}
                  limit={parseInt(limit)}
                  totalPages={filteredTotalPages}
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
