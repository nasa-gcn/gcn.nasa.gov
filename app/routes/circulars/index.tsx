/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  Button,
  Grid,
  GridContainer,
  Pagination,
} from '@trussworks/react-uswds'
import { Link, useLoaderData, useSubmit } from '@remix-run/react'
import type { DataFunctionArgs } from '@remix-run/node'
import { useEffect, useState } from 'react'
import { getUser } from '../__auth/user.server'
import { CircularsServer } from './circulars.server'
import { Hint } from 'react-autocomplete-hint'

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  const machine = await CircularsServer.create(request)
  const data = await machine.getCirculars('')
  const searchParams = new URL(request.url).searchParams
  const pageStr = searchParams.get('page')
  const searchTerm = searchParams.get('searchTerm')
  let filteredDataItems = data
  if (searchTerm) {
    filteredDataItems = filteredDataItems.filter(
      (x) =>
        x.subject.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||
        x.body.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
    )
  }
  const limit = 10 // searchParams.get('limit')
  const page = pageStr ? parseInt(pageStr) : 1

  return {
    email: user?.email,
    page: page,
    searchTerm,
    items: filteredDataItems.slice(limit * (page - 1), page * limit - 1),
    pageCount: Math.ceil(data.length / limit),
  }
}

export default function Index() {
  const { page, searchTerm, items, pageCount } = useLoaderData<typeof loader>()
  const [circulars, setCirculars] = useState(items)
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
    submit(new URLSearchParams({ searchTerm: term }), {
      action: '/circulars',
      replace: true,
    })
  }

  useEffect(() => {
    setCirculars(items)
  }, [items])

  return (
    <GridContainer>
      <div className="usa-prose">
        <h1>GCN Circulars</h1>
      </div>
      <p>
        GCN Circulars are rapid astronomical bulletins submitted by and
        distributed to community members worldwide. For more information, see{' '}
        <Link to="">docs</Link>
      </p>
      <div id="sticky-header" className="sticky margin-bottom-1 padding-top-1">
        <div className="usa-search">
          <Hint options={options} allowTabFill allowEnterFill>
            <input
              id="searchTerm"
              name="searchTerm"
              className="usa-input"
              defaultValue={term ?? ''}
              type="search"
              onChange={(e) => searchTermUpdate(e.target.value)}
              onKeyDown={(e) => keyboardTriggerSearch(e)}
            />
          </Hint>
          <Button className="usa-button" type="submit" onClick={triggerSearch}>
            <span className="usa-search__submit-text">Search </span>
            <img
              src="/assets/img/usa-icons-bg/search--white.svg"
              className="usa-search__submit-icon"
              alt="Search"
            />
          </Button>
        </div>
      </div>
      <div>
        {circulars?.map((circular) => (
          <Grid row key={circular.circularId}>
            <Link to={`./${circular.circularId}`}>
              {circular.circularId} - {circular.subject}
            </Link>
          </Grid>
        ))}
      </div>
      <div id="pagination">
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
      </div>
    </GridContainer>
  )
}
