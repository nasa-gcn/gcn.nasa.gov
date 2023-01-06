/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  Grid,
  GridContainer,
  Pagination,
  Search,
} from '@trussworks/react-uswds'
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react'
import type { DataFunctionArgs } from '@remix-run/node'
import { useEffect, useState } from 'react'
import { getUser } from '../__auth/user.server'
import { CircularsServer } from './circulars.server'

export async function loader({ request }: DataFunctionArgs) {
  if (!process.env['GCN_CIRCULARS_ENABLE'])
    throw new Response('', { status: 404 })
  const user = await getUser(request)
  const machine = await CircularsServer.create(request)
  const data = await machine.getCirculars('')
  const searchParams = new URL(request.url).searchParams
  const pageStr = searchParams.get('page')
  const searchTerm = searchParams.get('search')
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
    pageCount: Math.ceil(filteredDataItems.length / limit),
  }
}

export default function Index() {
  const { page, searchTerm, items, pageCount } = useLoaderData<typeof loader>()
  const [circulars, setCirculars] = useState(items)
  const submit = useSubmit()

  function triggerSearch(pageNumber: number) {
    const params = new URLSearchParams()
    params.set('page', pageNumber.toString())
    submit(
      new URLSearchParams({
        page: pageNumber.toString(),
        search: searchTerm ?? '',
      }),
      {
        action: '/circulars',
        replace: true,
      }
    )
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
      <div className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1">
        <div className="usa-search">
          <Form>
            <Search defaultValue={searchTerm ?? ''} onSubmit={() => {}} />
          </Form>
        </div>
      </div>
      <div>
        {circulars?.map((circular) => (
          <Grid row key={circular.circularId} className="padding-y-1">
            <Link to={`./${circular.circularId}`}>
              {circular.circularId} - {circular.subject}
            </Link>
          </Grid>
        ))}
      </div>
      <div>
        <Pagination
          pathname={''}
          totalPages={pageCount}
          currentPage={page}
          onClickNext={() => triggerSearch(page + 1)}
          onClickPrevious={() => triggerSearch(page - 1)}
          onClickPageNumber={(e) => {
            if (
              e.currentTarget.textContent &&
              parseInt(e.currentTarget.textContent)
            )
              triggerSearch(parseInt(e.currentTarget.textContent))
          }}
        />
      </div>
    </GridContainer>
  )
}
