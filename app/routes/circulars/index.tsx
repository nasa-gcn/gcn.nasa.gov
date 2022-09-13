/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  Accordion,
  Button,
  ButtonGroup,
  Pagination,
} from '@trussworks/react-uswds'
import { Link, useLoaderData, useSubmit } from '@remix-run/react'
import type { DataFunctionArgs } from '@remix-run/node'
import { useEffect, useState } from 'react'
import { getUser } from '../__auth/user.server'
import { CircularsServer } from '../api/circulars.server'
import { Hint } from 'react-autocomplete-hint'

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  const machine = await CircularsServer.create()
  const data = await machine.getCirculars('')
  const searchParams = new URL(request.url).searchParams
  const pageStr = searchParams.get('page')
  const searchTerm = searchParams.get('searchTerm')
  let filteredDataItems = data.items
  if (searchTerm) {
    filteredDataItems = filteredDataItems.filter(
      (x) =>
        x.subject.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||
        x.body.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
    )
  }
  const limit = 10 // searchParams.get('limit')
  const page = pageStr ? parseInt(pageStr) : 1
  const filter = searchParams.get('filter') ?? 'date'

  return {
    email: user?.email,
    page: page,
    searchTerm,
    items: filteredDataItems.slice(limit * (page - 1), page * limit - 1),
    pageCount: Math.ceil(data.items.length / limit),
    filter,
  }
}

export default function Index() {
  const { page, searchTerm, items, pageCount, filter } =
    useLoaderData<typeof loader>()

  const [circulars, setCirculars] = useState(items)
  //const [displayLimit, setDisplayLimit] = useState(10)
  const [currentFilter, setCurrentFilter] = useState(filter)
  const [term, setTerm] = useState(searchTerm ?? '')
  const options = [...new Set(circulars.map((x) => x.subject))]
  const submit = useSubmit()

  function searchTermUpdate(term: string) {
    setTerm(term)
  }

  function keyboardTriggerSearch(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key == 'Tab' || event.key == 'Enter') {
      triggerSearch()
    }
  }

  function triggerSearch() {
    const params = new URLSearchParams()
    params.set('searchTerm', term)
    submit(new URLSearchParams({ searchTerm: term, filter: currentFilter }), {
      action: '/circulars',
      replace: true,
    })
  }

  function updateFilterAndTriggerSearch(value: string) {
    setCurrentFilter(value)
    triggerSearch()
  }

  useEffect(() => {
    setCirculars(items)
  }, [items])

  return (
    <>
      <div className="grid-row">
        <h1 className="flex-fill">GCN Circulars</h1>
        <div className="display-flex tablet:grid-col-6 flex-auto margin-y-auto flex-justify-end">
          <Link to="" className="usa-button text-middle">
            Subscribe
          </Link>
          <Link to="submit" className="usa-button margin-right-0">
            Submit a Circular
          </Link>
        </div>
      </div>
      <p>
        GCN Circulars are rapid astronomical bulletins submitted by and
        distributed to community members worldwide. For more information, see{' '}
        <Link to="">docs</Link>
      </p>
      <div id="sticky-header" className="sticky margin-bottom-1 padding-top-1">
        <div className="grid-row">
          <h2>Circular Archive</h2>
        </div>
        <div className="grid-row">
          <div className="tablet:grid-col-10">
            <Hint options={options} allowTabFill allowEnterFill>
              <input
                id="searchTerm"
                name="searchTerm"
                className="usa-input margin-top-0 flex-fill"
                defaultValue={term ?? ''}
                type="text"
                onChange={(e) => searchTermUpdate(e.target.value)}
                onKeyDown={(e) => keyboardTriggerSearch(e)}
              />
            </Hint>
          </div>
          <div className="tablet:grid-col-2 flex-auto display-flex flex-justify-end">
            <Button
              type="button"
              onClick={triggerSearch}
              className="usa-button margin-right-0 tablet:margin-top-0 margin-top-1"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="grid-row padding-top-05">
          <ButtonGroup type="segmented" className="flex-fill">
            <Button
              type="button"
              outline={currentFilter != 'date'}
              onClick={() => updateFilterAndTriggerSearch('date')}
            >
              By Date
            </Button>
            <Button
              type="button"
              outline={currentFilter != 'event'}
              onClick={() => updateFilterAndTriggerSearch('event')}
            >
              By Event
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="grid-row">
        <Accordion
          items={circulars.map((circular) => ({
            title: circular.id + ' ' + circular.subject,
            content: (
              <div key={circular.id} className="text-pre-wrap">
                {circular.body}
              </div>
            ),
            expanded: false,
            id: circular.id?.toString() ?? '',
            headingLevel: 'h4',
          }))}
          multiselectable
          bordered
        />
      </div>
      <Pagination
        pathname={''}
        totalPages={pageCount}
        currentPage={page}
        onClickNext={() => console.log('next')}
        onClickPrevious={() => console.log('prev')}
        onClickPageNumber={(e) => {
          console.log(e)
        }}
      />
    </>
  )
}
