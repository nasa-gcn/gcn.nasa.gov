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
  ButtonGroup,
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

const limit = 100

export async function loader({ request: { url } }: DataFunctionArgs) {
  const { searchParams } = new URL(url)
  const query = searchParams.get('query') || undefined
  if (query) {
    await circularRedirect(query)
  }
  const page = parseInt(searchParams.get('page') || '1')
  const results = await search({ query, page: page - 1, limit })
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

function getPageLink(page: number, query?: string) {
  const searchParams = new URLSearchParams({ page: page.toString() })
  if (query) searchParams.set('query', query)
  return `?${searchParams.toString()}`
}

function Pagination({
  page,
  totalPages,
  query,
}: {
  page: number
  totalPages: number
  query?: string
}) {
  const pages = usePagination({ currentPage: page, totalPages })

  return (
    <nav aria-label="Pagination" className="usa-pagination">
      <ul className="usa-pagination__list">
        {pages.map(({ type, number, isCurrent }, i) => {
          switch (type) {
            case 'prev':
              return (
                <li
                  className="usa-pagination__item usa-pagination__arrow"
                  key={i}
                >
                  <Link
                    to={getPageLink(number!, query)}
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
                    to={getPageLink(number!, query)}
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
                    to={getPageLink(number!, query)}
                    className={classNames('usa-pagination__button', {
                      'usa-current': isCurrent,
                    })}
                    prefetch="render"
                    aria-label={`Page ${number}`}
                    aria-current={isCurrent}
                  >
                    {number}
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
  const query = searchParams.get('query') ?? undefined
  let searchParamsString = searchParams.toString()
  if (searchParamsString) searchParamsString = `?${searchParamsString}`

  const [input, setInput] = useState(query)
  const clean = input === query

  const submit = useSubmit()

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
      <ButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1">
        <Form
          className="display-inline-block usa-search usa-search--small"
          role="search"
        >
          <Label srOnly={true} htmlFor="query">
            Search
          </Label>
          <TextInput
            id="query"
            name="query"
            type="search"
            defaultValue={query}
            placeholder="Search"
            aria-describedby="searchHint"
            onChange={({ target: { form, value } }) => {
              setInput(value)
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
        <Link to="/circulars/new">
          <Button
            type="button"
            className="height-4 padding-top-0 padding-bottom-0"
          >
            <Icon.Edit /> New
          </Button>
        </Link>
      </ButtonGroup>
      <Hint id="searchHint">
        Search for Circulars by submitter, subject, or body text (e.g. 'Fermi GRB').
        <br />
        To navigate to a specific circular, enter the associated Circular
        ID (e.g. 'gcn123', 'Circular 123', or '123').
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
                <Link to={`/circulars/${circularId}${searchParamsString}`}>
                  {subject}
                </Link>
              </li>
            ))}
          </ol>
          {totalPages > 1 && (
            <Pagination query={query} page={page} totalPages={totalPages} />
          )}
        </>
      )}
    </>
  )
}
