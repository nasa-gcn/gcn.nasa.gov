/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
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
  Dropdown,
  Grid,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import classNames from 'classnames'
import { useState } from 'react'

import { circularRedirect, put, search } from './circulars.server'
import Hint from '~/components/Hint'
import { usePagination } from '~/lib/pagination'
import { getFormDataString } from '~/lib/utils'

import searchImg from 'app/theme/img/usa-icons-bg/search--white.svg'

// const limit = 100

export async function loader({ request: { url } }: DataFunctionArgs) {
  const { searchParams } = new URL(url)
  const query = searchParams.get('query') || undefined
  if (query) {
    await circularRedirect(query)
  }
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '100')
  const results = await search({
    query,
    page: page - 1,
    limit,
    startDate,
    endDate,
  })

  return { page, ...results }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  return await put(subject, body, request)
}

function getPageLink({
  page,
  limit,
  query,
  startDate,
  endDate,
}: {
  page: number
  limit?: string
  query?: string
  startDate?: string
  endDate?: string
}) {
  const searchParams = new URLSearchParams()
  if (page > 1) searchParams.set('page', page.toString())
  if (limit && limit != '100') searchParams.set('limit', limit)
  if (query) searchParams.set('query', query)
  if (startDate) searchParams.set('startDate', startDate)
  if (endDate) searchParams.set('endDate', endDate)

  const searchParamsString = searchParams.toString()
  return searchParamsString && `?${searchParamsString}`
}

function Pagination({
  page,
  totalPages,
  ...queryStringProps
}: {
  page: number
  totalPages: number
  limit?: string
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
                    <Icon.NavigateBefore aria-hidden />
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
                    <Icon.NavigateNext aria-hidden />
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

export default function () {
  const newItem = useActionData<typeof action>()
  const { items, page, totalPages, totalItems } = useLoaderData<typeof loader>()

  // Concatenate items from the action and loader functions
  const allItems = [...(newItem ? [newItem] : []), ...(items || [])]

  const [searchParams] = useSearchParams()
  const limit = searchParams.get('limit') ?? '100'
  const query = searchParams.get('query') ?? undefined
  const startDate = searchParams.get('startDate') ?? undefined
  const endDate = searchParams.get('endDate') ?? undefined

  let searchParamsString = searchParams.toString()
  if (searchParamsString) searchParamsString = `?${searchParamsString}`

  const [inputQuery, setInputQuery] = useState(query)
  const clean = inputQuery === query

  const submit = useSubmit()

  return (
    <>
      <Grid row>
        <div className="tablet:grid-col flex-fill">
          <h1 className="float-left margin-bottom-0">GCN Circulars</h1>
        </div>
        <div className="tablet:grid-col flex-auto">
          <Link className="usa-button" to="/circulars/new">
            <Icon.Edit /> Submit New Circular
          </Link>
        </div>
      </Grid>
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
      <div className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1">
        <Form className="usa-search usa-search--small width-full">
          <Label htmlFor="query">Search</Label>

          <TextInput
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

          <Hint id="searchHint">
            Search for Circulars by submitter, subject, or body text (e.g.
            'Fermi GRB'). <br />
            To navigate to a specific circular, enter the associated Circular ID
            (e.g. 'gcn123', 'Circular 123', or '123').
          </Hint>
          {true && (
            <>
              {query && (
                <h3>
                  {totalItems} result{totalItems != 1 && 's'} found.
                </h3>
              )}
              <ol>
                {allItems.map(({ circularId, subject }) => (
                  <li key={circularId} value={circularId}>
                    <Link to={`/circulars/${circularId}${searchParamsString}`}>
                      {subject}
                    </Link>
                  </li>
                ))}
              </ol>
              <div className=" grid-row">
                <div className="tablet:grid-col-4 grid-col-6 tablet:padding-x-1">
                  <Label className="margin-top-auto" htmlFor="value">
                    Results Per Page
                  </Label>
                  <Dropdown
                    id="limit"
                    className="usa-select height-4  margin-y-0 padding-y-0"
                    name="limit"
                    defaultValue={limit}
                    onChange={({ target: { form, value } }) => {
                      submit(form)
                    }}
                  >
                    <option value="100">100</option>
                    <option value="250">250</option>
                    <option value="500">500</option>
                  </Dropdown>
                </div>
                <div className="tablet:grid ">
                  <div className="display-flex">
                    {totalPages > 1 && (
                      <Pagination
                        query={query}
                        page={page}
                        limit={limit}
                        totalPages={totalPages}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Form>
      </div>
    </>
  )
}
