/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import {
  Button,
  Grid,
  GridContainer,
  Icon,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useId, useState } from 'react'

import { getUser } from './_auth/user.server'
import { moderatorGroup } from './circulars/circulars.server'
import type { SynonymGroup } from './synonyms/synonyms.lib'
import { searchSynonymsByEventId } from './synonyms/synonyms.server'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import PaginationSelectionFooter from '~/components/pagination/PaginationSelectionFooter'

import searchImg from 'nasawds/src/img/usa-icons-bg/search--white.svg'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || undefined
  const limit = parseInt(searchParams.get('limit') || '100')
  const page = parseInt(searchParams.get('page') || '1')
  const synonyms = searchSynonymsByEventId({ page, eventId: query, limit })

  return synonyms
}

function SynonymList({ synonyms }: { synonyms: SynonymGroup[] }) {
  return (
    <ul>
      {synonyms.map((synonym) => {
        return (
          <li key={synonym.synonymId}>
            <Link to={`/synonyms/${synonym.synonymId}`}>
              {synonym.eventIds.join(', ')}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
export default function () {
  const { synonyms, page, totalPages } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const formId = useId()
  const [searchParams] = useSearchParams()
  const limit = searchParams.get('limit') || '100'
  const query = searchParams.get('query') || ''

  const [inputQuery, setInputQuery] = useState('')

  return (
    <>
      <h1>Synonym Group Moderation</h1>
      <GridContainer>
        <Grid row>
          <ToolbarButtonGroup className="position-sticky top-0 bg-white margin-bottom-1 padding-top-1 z-300">
            <Form
              preventScrollReset
              className="display-inline-block usa-search usa-search--small"
              role="search"
              id={formId}
            >
              <Label srOnly htmlFor="query">
                Search
              </Label>
              <TextInput
                autoFocus
                className="minw-15"
                id="query"
                name="query"
                type="search"
                defaultValue={inputQuery}
                placeholder="Search"
                aria-describedby="searchHint"
                onChange={({ target: { form, value } }) => {
                  setInputQuery(value)
                  if (!value) submit(form, { preventScrollReset: true })
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
            <Link to="/synonyms/new">
              <Button type="button" className="padding-y-1">
                <Icon.Edit role="presentation" /> New
              </Button>
            </Link>
          </ToolbarButtonGroup>
        </Grid>
      </GridContainer>
      <SynonymList synonyms={synonyms} />
      <PaginationSelectionFooter
        query={query}
        page={page}
        totalPages={totalPages}
        limit={parseInt(limit)}
        form={formId}
      />
    </>
  )
}
