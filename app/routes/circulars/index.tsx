/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { Button, ButtonGroup, Icon, Search } from '@trussworks/react-uswds'
import { Link, useLoaderData } from '@remix-run/react'
import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { list, put } from './circulars.server'
import classNames from 'classnames'
import { usePagination } from '~/lib/pagination'
import { getFormDataString } from '~/lib/utils'
import { feature } from '~/root'

export async function loader({ request: { url } }: DataFunctionArgs) {
  if (!feature('circulars')) throw redirect('/circulars/classic')

  const { searchParams } = new URL(url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const results = await list({ page, limit: 100 })

  return {
    page,
    ...results,
  }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  await put(subject, body, request)
  return null
}

export default function Index() {
  const { page, totalPages, items } = useLoaderData<typeof loader>()
  const pages = usePagination({ currentPage: page, totalPages })

  return (
    <>
      <h1>GCN Circulars</h1>
      <p className="usa-paragraph">
        GCN Circulars are rapid astronomical bulletins submitted by and
        distributed to community members worldwide. For more information, see{' '}
        <Link to="">docs</Link>
      </p>
      <ButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1">
        <div className="usa-search display-inline-block">
          <Search
            defaultValue=""
            size="small"
            placeholder="Search"
            onSubmit={() => {}}
          />
        </div>
        <Link to="/circulars/new">
          <Button
            type="button"
            className="height-4 padding-top-0 padding-bottom-0"
          >
            <Icon.Edit /> New
          </Button>
        </Link>
      </ButtonGroup>
      <ol>
        {items.map(({ circularId, subject }) => (
          <li key={circularId} value={circularId}>
            <Link to={`/circulars/${circularId}`}>{subject}</Link>
          </li>
        ))}
      </ol>
      <div>
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
                        to={`?page=${number}`}
                        className="usa-pagination__link usa-pagination__previous-page"
                        aria-label="Previous page"
                      >
                        <Icon.NavigateBefore aria-hidden />
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
                        to={`?page=${number}`}
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
                        to={`?page=${number}`}
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
      </div>
    </>
  )
}
