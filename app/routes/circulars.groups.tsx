import type { DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Icon } from '@trussworks/react-uswds'

import { getCircularsGroupedByEvent } from './circulars/circulars.server'

export async function loader({ request: { url } }: DataFunctionArgs) {
  const { searchParams } = new URL(url)
  const currentPage = parseInt(searchParams.get('page') || '1')
  const afterKeyParams = searchParams.get('after-key')
  const currentAfterKey = afterKeyParams ? JSON.parse(afterKeyParams) : null
  const afterKeyHistoryParams = searchParams.get('after-key-history')
  const currentAfterKeyHistory = afterKeyHistoryParams
    ? JSON.parse(afterKeyHistoryParams)
    : []
  const { items, page, hasNextPage, afterKey, afterKeyHistory } =
    await getCircularsGroupedByEvent({
      page: currentPage,
      afterKey: currentAfterKey,
      afterKeyHistory: currentAfterKeyHistory,
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
  const previousPageIndex = previousPage - 1
  const nextPage = page + 1

  if (action === 'prev') {
    if (page) searchParams.set('page', previousPage.toString())
    const newAfterKey =
      afterKeyHistory && afterKeyHistory[previousPageIndex]
        ? JSON.stringify(afterKeyHistory[previousPageIndex]).toString()
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

  return (
    <>
      <h1>Related Events</h1>
      <div className="">
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
