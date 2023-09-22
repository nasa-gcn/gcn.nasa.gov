import type { DataFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
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
import { useState } from 'react'

import { getCircularsGroupedByEvent } from './circulars/circulars.server'
import Hint from '~/components/Hint'

import searchImg from '~/../node_modules/nasawds/src/img/usa-icons-bg/search--white.svg'

export async function loader({ request: { url } }: DataFunctionArgs) {
  const { searchParams } = new URL(url)
  const currentPage = parseInt(searchParams.get('page') || '1')
  const afterKeyParams = searchParams.get('after-key')
  const currentAfterKey = afterKeyParams ? JSON.parse(afterKeyParams) : null
  const afterKeyHistoryParams = searchParams.get('after-key-history')
  const currentAfterKeyHistory = afterKeyHistoryParams
    ? JSON.parse(afterKeyHistoryParams)
    : []
  const eventId = searchParams.get('event-id') || undefined
  const { items, page, hasNextPage, afterKey, afterKeyHistory } =
    await getCircularsGroupedByEvent({
      page: currentPage,
      afterKey: currentAfterKey,
      afterKeyHistory: currentAfterKeyHistory,
      eventId,
    })

  return { page, items, hasNextPage, afterKey, afterKeyHistory }
}

function getPageLink({
  afterKey,
  afterKeyHistory,
  page = 1,
  action,
}: {
  afterKey?: object
  afterKeyHistory: object[]
  page?: number
  action: string
}) {
  const searchParams = new URLSearchParams()
  if (afterKeyHistory)
    searchParams.set(
      'after-key-history',
      JSON.stringify(afterKeyHistory).toString()
    )
  const previousPage = page - 1
  const nextPage = page + 1

  if (action === 'prev') {
    if (page) searchParams.set('page', previousPage.toString())
    const newAfterKey =
      afterKeyHistory && afterKeyHistory[previousPage]
        ? JSON.stringify(afterKeyHistory[previousPage]).toString()
        : ''
    searchParams.set('after-key', newAfterKey)
  } else {
    if (page) searchParams.set('page', nextPage.toString())
    searchParams.set('after-key', JSON.stringify(afterKey).toString())
  }

  const searchString = searchParams.toString()
  return searchString && `?${searchString}`
}

function Pagination({
  page,
  afterKey,
  afterKeyHistory,
  hasNextPage,
}: {
  page: number
  afterKey?: object
  afterKeyHistory: object[]
  hasNextPage: boolean
}) {
  return (
    <nav aria-label="Pagination" className="usa-pagination">
      <ul className="usa-pagination__list">
        {page > 1 && (
          <li
            id="prev"
            className="usa-pagination__item usa-pagination__arrow"
            key="prev"
          >
            <Link
              to={getPageLink({
                page,
                afterKeyHistory,
                afterKey,
                action: 'prev',
              })}
              className="usa-pagination__link usa-pagination__previous-page"
              aria-label="Previous page"
            >
              <Icon.NavigateBefore role="presentation" />
              <span className="usa-pagination__link-text">Previous</span>
            </Link>
          </li>
        )}
        {hasNextPage && (
          <li
            id="next"
            className="usa-pagination__item usa-pagination__arrow"
            key="next"
          >
            <Link
              to={getPageLink({
                page,
                afterKeyHistory,
                afterKey,
                action: 'next',
              })}
              className="usa-pagination__link usa-pagination__next-page"
              aria-label="Next page"
            >
              <Icon.NavigateNext role="presentation" />
              <span className="usa-pagination__link-text">Next</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default function () {
  const { items, afterKey, page, afterKeyHistory, hasNextPage } =
    useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('event-id') || undefined
  const [inputQuery, setInputQuery] = useState(query)

  let searchString = searchParams.toString()
  if (searchString) searchString = `?${searchString}`

  const submit = useSubmit()
  return (
    <>
      <h1>Related Events</h1>
      <p className="usa-paragraph">
        <b>Search GCN Circulars for related event groups.</b> To filter GCN
        Circulars by related event ids, search by any event id. For more
        information visit the <Link to="/circulars">index </Link>
        or visit our<Link to="/docs/circulars">documentation page</Link> for
        help with subscribing to or submitting Circulars.
      </p>
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
            id="event-id"
            name="event-id"
            type="search"
            defaultValue={inputQuery}
            placeholder="Event Id"
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
        <Link to={`/circulars`}>
          <Button
            type="button"
            className="height-4 padding-top-0 padding-bottom-0"
          >
            View Index
          </Button>
        </Link>
      </ButtonGroup>
      <Hint id="searchHint">
        Search for Circulars by Event Id. <br />
        (e.g. 'GRB 123456A').
      </Hint>
      <div className="margin-top-2">
        {items.map(({ id, circulars }) => (
          <>
            <details>
              <summary>{id}</summary>
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
      <div className="display-flex flex-row flex-wrap">
        <div className="display-flex flex-fill">
          <Pagination
            page={page}
            afterKey={afterKey}
            afterKeyHistory={afterKeyHistory}
            hasNextPage={hasNextPage}
          />
        </div>
      </div>
    </>
  )
}
