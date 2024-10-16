/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  redirect,
  useFetcher,
  useLoaderData,
  useSubmit,
} from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  CardBody,
  FormGroup,
  Grid,
  TextInput,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import { getUser } from './_auth/user.server'
import { moderatorGroup } from './circulars/circulars.server'
import {
  autoCompleteEventIds,
  createSynonyms,
} from './synonyms/synonyms.server'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const eventIds = getFormDataString(data, 'synonyms')?.split(',')
  if (!eventIds) throw new Response(null, { status: 400 })
  const synonymId = await createSynonyms(eventIds)
  return redirect(`/synonyms/${synonymId}`)
}

export async function loader(args: LoaderFunctionArgs) {
  const url = new URL(args.request.url)
  const query = url.searchParams.get('query')
  if (query) {
    return await autoCompleteEventIds({ query })
  }
  return { options: [] }
}

export default function () {
  const ref = useRef<HTMLDivElement>(null)
  const fetcher = useFetcher()
  const submit = useSubmit()

  const [showContent, setShowContent] = useState(false)
  useOnClickOutside(ref, () => {
    setShowContent(false)
  })
  const [synonyms, setSynonyms] = useState([] as string[])
  const uniqueSynonyms = Array.from(new Set(synonyms)) as string[]
  const [input, setInput] = useState('')

  const { options } = useLoaderData<typeof loader>()
  const uniqueOptions = Array.from(new Set(options)) as string[]

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (input.length >= 3)
        submit({ query: input }, { preventScrollReset: true })
    }, 3000)

    return () => clearTimeout(delayDebounceFn)
  }, [input, submit])

  return (
    <>
      <h1>Create New Synonym Group</h1>
      <Grid row>
        <fetcher.Form method="get">
          <TextInput
            className="border-1px"
            autoComplete="off"
            type="search"
            name="query"
            value={input}
            onChange={({ target: { form, value } }) => {
              setInput(value)
              setShowContent(true)
              if (value.length >= 3) submit(form, { preventScrollReset: true })
            }}
            id="query-input"
          />
        </fetcher.Form>
      </Grid>
      {uniqueOptions.length && input && showContent ? (
        <div ref={ref}>
          <DetailsDropdownContent>
            <CardBody>
              {uniqueOptions.map((eventId: string) => (
                <div
                  key={eventId}
                  className="hover:bg-primary-lighter"
                  onClick={() => {
                    setSynonyms([...synonyms, eventId])
                    setInput('')
                  }}
                >
                  {eventId}
                </div>
              ))}
            </CardBody>
          </DetailsDropdownContent>
        </div>
      ) : null}
      <Form method="POST">
        <FormGroup className="margin-left-1">
          <input type="hidden" name="synonyms" value={uniqueSynonyms} />
          <ul className="usa-list usa-list--unstyled">
            {uniqueSynonyms?.map((synonym) => (
              <li key={synonym}>
                <ButtonGroup>
                  {synonym}
                  <Button
                    className="usa-button--unstyled"
                    type="button"
                    onClick={() => {
                      setSynonyms(
                        synonyms.filter(function (item) {
                          return item !== synonym
                        })
                      )
                    }}
                  >
                    Remove
                  </Button>
                </ButtonGroup>
              </li>
            ))}
          </ul>
        </FormGroup>
        <FormGroup>
          <Button type="submit" disabled={!(synonyms.length > 1)}>
            Create
          </Button>
        </FormGroup>
      </Form>
    </>
  )
}
