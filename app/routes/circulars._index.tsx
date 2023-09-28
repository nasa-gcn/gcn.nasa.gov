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
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Button,
  ButtonGroup,
  Icon,
  Label,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  Select,
  TextInput,
} from '@trussworks/react-uswds'
import classNames from 'classnames'
import clamp from 'lodash/clamp'
import { useRef, useState } from 'react'

import type {
  Circular,
  CircularGroupingMetadata,
  FilteredMetadata,
} from './circulars/circulars.lib'
import {
  circularRedirect,
  getCircularsGroupedBySynonyms,
  getUniqueSynonymsArrays,
  search,
} from './circulars/circulars.server'
import type { action as actionType } from './circulars/route'
import Hint from '~/components/Hint'
import { usePagination } from '~/lib/pagination'

import searchImg from '~/../node_modules/nasawds/src/img/usa-icons-bg/search--white.svg'

const AfterKeyHistoryIndex: object[] = []

export async function loader({ request }: DataFunctionArgs) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || undefined
  if (query) {
    await circularRedirect(query)
  }
  const currentPage = parseInt(searchParams.get('page') || '1')
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)
  const afterKeyParams = searchParams.get('after-key')
  const currentAfterKey =
    afterKeyParams && currentPage > 1 ? JSON.parse(afterKeyParams) : null
  const searchResponse = await search({
    query,
    page: currentPage - 1,
    limit,
    startDate,
    endDate,
  })
  const { synonyms, totalItems, totalPages } = await getUniqueSynonymsArrays({
    page: currentPage,
    eventId: query,
    limit,
  })
  const checkedSynonyms = synonyms || undefined
  const { results } = await getCircularsGroupedBySynonyms({
    synonyms: checkedSynonyms,
  })
  const combinedResults: FilteredMetadata = {
    groups: {
      page: currentPage,
      items: results.groups,
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
  if (currentAfterKey) AfterKeyHistoryIndex.push(currentAfterKey)
  return { ...combinedResults }
}

function getPageLink({
  page,
  limit,
  query,
  startDate,
  endDate,
  filter,
}: {
  page: number
  limit?: number
  query?: string
  startDate?: string
  endDate?: string
  filter?: string
}) {
  const searchParams = new URLSearchParams()
  if (page > 1) {
    searchParams.set('page', page.toString())
  } else searchParams.set('page', '1')
  if (limit && limit != 100) searchParams.set('limit', limit.toString())
  if (query) searchParams.set('query', query)
  if (startDate) searchParams.set('startDate', startDate)
  if (endDate) searchParams.set('endDate', endDate)
  if (filter) searchParams.set('filter', filter)

  const searchString = searchParams.toString()
  return searchString && `?${searchString}`
}

function Pagination({
  page,
  totalPages,
  filter,
  ...queryStringProps
}: {
  page: number
  totalPages: number
  filter: string
  limit?: number
  query?: string
  startDate?: string
  endDate?: string
}) {
  const submit = useSubmit()
  const pages = usePagination({ currentPage: page, totalPages })

  return (
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
      </div>
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
                      <span className="usa-pagination__link-text">
                        Previous
                      </span>
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
                  <li key={i}>
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
    </>
  )
}

function GroupedView({
  allItems,
  searchString,
  query,
  totalItems,
}: {
  allItems: CircularGroupingMetadata[]
  searchString: string
  query?: string
  totalItems: number
}) {
  if (searchString) searchString = `?${searchString}`
  return (
    <>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}
      <div className="margin-top-2">
        {allItems.map(({ circulars }) => (
          <>
            <details>
              <summary>{circulars[0].synonyms?.join(', ')}</summary>
              <ol className="">
                {circulars.map(({ circularId, subject }) => (
                  <li
                    id={circularId.toString()}
                    value={circularId}
                    key={circularId.toString()}
                    className="border-base-lighter"
                  >
                    <Link className="" to={`/circulars/${circularId}`}>
                      {subject}
                    </Link>
                  </li>
                ))}
              </ol>
            </details>
          </>
        ))}
      </div>
    </>
  )
}

function DownloadModal() {
  const modalRef = useRef<ModalRef>(null)
  return (
    <>
      <h2>Advanced</h2>
      <ModalToggleButton
        modalRef={modalRef}
        opener
        outline
        className="text-middle"
      >
        <Icon.FileDownload
          role="presentation"
          className="bottom-aligned margin-right-05"
        />
        Download Archive
      </ModalToggleButton>
      <Modal
        renderToPortal={false}
        ref={modalRef}
        id="example-modal-1"
        aria-labelledby="modal-1-heading"
        aria-describedby="modal-1-description"
      >
        <ModalHeading id="modal-1-heading">
          GCN Circulars Database Download
        </ModalHeading>
        <div className="usa-prose">
          <p id="modal-1-description">
            This is a download of the entire GCN Circulars database.
          </p>
          <p>Select a file format to begin download.</p>
        </div>
        <ModalFooter>
          <ButtonGroup>
            <ModalToggleButton modalRef={modalRef} closer>
              <a
                className="text-no-underline text-white"
                href="/circulars/archive.txt.tar.gz"
              >
                Text
              </a>
            </ModalToggleButton>

            <ModalToggleButton modalRef={modalRef} closer>
              <a
                className="text-no-underline text-white"
                href="/circulars/archive.json.tar.gz"
              >
                JSON
              </a>
            </ModalToggleButton>
            <ModalToggleButton
              modalRef={modalRef}
              closer
              outline
              className="text-center"
            >
              Cancel
            </ModalToggleButton>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </>
  )
}

function CircularsIndex({
  query,
  totalItems,
  allItems,
  searchString,
}: {
  totalItems: number
  allItems: Circular[]
  searchString: string
  query?: string
}) {
  return (
    <>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}
      <ol>
        {allItems.map(({ circularId, subject }, index) => (
          <li key={circularId} value={circularId}>
            <Link to={`/circulars/${circularId}${searchString}`}>
              {subject}
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}

function Search({
  query,
  searchString,
  limit,
  startDate,
  endDate,
}: {
  query?: string
  searchString: string
  limit: string
  startDate?: string
  endDate?: string
}) {
  const { groups, index } = useLoaderData<typeof loader>()
  // Concatenate items from the action and loader functions
  const newItem = useActionData<typeof actionType>()
  const allItems = [...(newItem ? [newItem] : []), ...(index.items || [])]
  const allGroups = (groups.items as CircularGroupingMetadata[]) || []
  const [inputQuery, setInputQuery] = useState(query)
  const [groupsChecked, setGroupsChecked] = useState(false)
  const [circularsChecked, setCircularsChecked] = useState(true)
  const [filter, setFilter] = useState('circulars')
  const filteredPage = filter === 'circulars' ? index.page : groups.page
  const filteredTotalPages =
    filter === 'circulars' ? index.totalPages : groups.totalPages
  const clean = inputQuery === query
  const submit = useSubmit()
  return (
    <>
      <ButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1">
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
      <details className="margin-top-1 open">
        <summary className="">Advanced Search Filters</summary>
        <div className="margin-left-3">
          <fieldset className="usa-fieldset">
            <div className="usa-radio maxw-card-lg">
              <input
                className="usa-radio__input usa-radio__input--tile"
                id="circulars"
                type="radio"
                name="circulars"
                value={circularsChecked.toString()}
                checked={circularsChecked}
                onClick={() => {
                  setCircularsChecked(!circularsChecked)
                  setGroupsChecked(!groupsChecked)
                  if (filter === 'groups') setFilter('circulars')
                }}
                onChange={({ target: { form } }) => {
                  submit(form)
                }}
              />
              <label className="usa-radio__label" htmlFor="circulars">
                Circulars
                <span className="usa-checkbox__label-description">
                  View Circulars index.
                </span>
              </label>
            </div>
            <div className="usa-radio maxw-card-lg">
              <input
                className="usa-radio__input usa-radio__input--tile"
                id="groups"
                type="radio"
                name="groups"
                value={groupsChecked.toString()}
                checked={groupsChecked}
                onChange={() => {
                  setCircularsChecked(!circularsChecked)
                  setGroupsChecked(!groupsChecked)
                  if (filter === 'circulars') setFilter('groups')
                }}
              />
              <label className="usa-radio__label" htmlFor="groups">
                Groups
                <span className="usa-checkbox__label-description">
                  View Circulars grouped by synonymous events.
                </span>
              </label>
            </div>
          </fieldset>
        </div>
      </details>
      {clean && filter === 'circulars' && (
        <CircularsIndex
          query={query}
          totalItems={index.totalItems}
          allItems={allItems as Circular[]}
          searchString={searchString}
        ></CircularsIndex>
      )}
      {clean && filter === 'groups' && (
        <GroupedView
          allItems={allGroups}
          searchString={searchString}
          query={query}
          totalItems={groups.totalItems}
        />
      )}
      <div className="display-flex flex-row flex-wrap">
        <div className="display-flex flex-fill">
          <Pagination
            query={query}
            page={filteredPage}
            limit={parseInt(limit)}
            totalPages={filteredTotalPages}
            startDate={startDate}
            endDate={endDate}
            filter={filter || 'groups'}
          />
        </div>
      </div>
    </>
  )
}

function IndexHeader() {
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
        <Link to="/docs/circulars">documentation</Link> for help with
        subscribing to or submitting Circulars.
      </p>
    </>
  )
}

export default function () {
  const [searchParams] = useSearchParams()
  const limit = searchParams.get('limit') || '100'
  const query = searchParams.get('query') || undefined
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  return (
    <>
      <IndexHeader />
      <Search
        query={query}
        searchString={searchString}
        limit={limit}
        startDate={startDate}
        endDate={endDate}
      />
      <DownloadModal />
    </>
  )
}
