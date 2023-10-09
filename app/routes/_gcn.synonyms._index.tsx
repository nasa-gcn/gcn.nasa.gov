/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type DataFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { clamp } from 'lodash'
import { useState } from 'react'

import CircularPagination from './_gcn.circulars._archive._index/CircularPagination'
import { getSynonyms } from './_gcn.synonyms/synonyms.server'

import searchImg from 'nasawds/src/img/usa-icons-bg/search--white.svg'

export async function loader({ request }: DataFunctionArgs) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || undefined
  const currentPage = parseInt(searchParams.get('page') || '1')
  const limit = clamp(parseInt(searchParams.get('limit') || '100'), 1, 100)

  const synonyms = await getSynonyms({
    limit,
    page: currentPage,
    eventId: query,
  })
  return { ...synonyms }
}

export default function () {
  const { synonyms, totalPages, page, totalItems } =
    useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const [inputQuery, setInputQuery] = useState('')
  const limit = searchParams.get('limit') || '100'
  const query = searchParams.get('query') || undefined

  return (
    <>
      <h1>Synonymous Events</h1>
      <p className="usa-paragraph margin-bottom-2">
        <b>
          Synonyms are event identifiers that are synonymous with each other.
        </b>{' '}
        Synonyms are groupings are curated by moderators. They are comma
        separated lists of event identifiers utilized to group circulars by a
        common event.
      </p>
      <ButtonGroup>
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
            defaultValue={inputQuery || query}
            placeholder="Search"
            aria-describedby="searchHint"
            onChange={({ target: { form, value } }) => {
              setInputQuery(value)
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
        <Link type="Link" to="/synonyms/new" className="usa-button">
          <div className="position-relative">
            <Icon.Add
              role="presentation"
              className="position-absolute top-0 left-0"
            />
          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;New
        </Link>
      </ButtonGroup>
      {query && (
        <h3>
          {totalItems} result{totalItems != 1 && 's'} found.
        </h3>
      )}
      <ul className="margin-top-2">
        {Object.keys(synonyms).map((key) => {
          const encodedUri = `/synonyms/${key}`
          return (
            <li key={encodedUri}>
              <Link to={encodedUri}>{synonyms[key].join(', ')}</Link>
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <CircularPagination
          query={query}
          page={page}
          limit={parseInt(limit)}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
