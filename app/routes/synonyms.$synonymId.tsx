/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Button, ButtonGroup, FormGroup, Icon } from '@trussworks/react-uswds'
import { useState } from 'react'
import invariant from 'tiny-invariant'

import {
  deleteSynonyms,
  getSynonymsByUuid,
  putSynonyms,
} from './synonyms/synonyms.server'
import { getFormDataString } from '~/lib/utils'

export async function loader({ params: { synonymId } }: LoaderFunctionArgs) {
  invariant(synonymId)
  const synonyms = await getSynonymsByUuid(synonymId)
  const eventIds = synonyms.map((synonym) => synonym.eventId)

  return {
    eventIds,
  }
}

export async function action({
  request,
  params: { synonymId },
}: ActionFunctionArgs) {
  invariant(synonymId)
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')

  if (intent === 'edit') {
    const additions =
      getFormDataString(data, 'addSynonyms')?.split(',') || ([] as string[])
    const filtered_additions = additions.filter((add) => add)
    const subtractions =
      getFormDataString(data, 'deleteSynonyms')?.split(',') || ([] as string[])
    const filtered_subtractions = subtractions.filter((sub) => sub)
    await putSynonyms({
      synonymId,
      additions: filtered_additions,
      subtractions: filtered_subtractions,
    })
    return null
  } else if (intent === 'delete') {
    await deleteSynonyms(synonymId)
    return redirect('/synonyms')
  } else {
    throw new Response('Unknown intent.', {
      status: 400,
    })
  }
}

export default function () {
  const { eventIds } = useLoaderData<typeof loader>()
  const [deleteSynonyms, setDeleteSynonyms] = useState([] as string[])
  const [synonyms, setSynonyms] = useState(eventIds || [])
  const [addSynonyms, setAddSynonyms] = useState([] as string[])
  const [newSynonym, setNewSynonym] = useState('')

  return (
    <>
      <ButtonGroup>
        <h1>Synonym Group</h1>
        <ButtonGroup className="margin-bottom-2">
          <Link to="/synonyms" className="usa-button">
            <div className="display-inline">
              <Icon.ArrowBack
                role="presentation"
                className="position-relative"
              />
            </div>
          </Link>
          <Form method="POST">
            <input type="hidden" name="intent" value="delete" />
            <Button type="submit">
              <Icon.Delete
                role="presentation"
                className="bottom-aligned margin-right-05"
              />
            </Button>
          </Form>
        </ButtonGroup>
      </ButtonGroup>
      <p>
        Synonym groupings are limited to 25 synonymous event identifiers. If you
        are adding an event identifier that is already part of a group, it will
        be removed from the previous association and added to this group.
      </p>
      <Form>
        <FormGroup>
          <ButtonGroup>
            <input
              placeholder="event id"
              value={newSynonym}
              key="synonym"
              onChange={(e) => {
                setNewSynonym(e.currentTarget.value)
              }}
            />
            <Button
              type="button"
              onClick={(e) => {
                if (!newSynonym) return
                setDeleteSynonyms(
                  deleteSynonyms.filter(function (item) {
                    return item !== newSynonym
                  })
                )
                const existingSynonyms = [...synonyms, newSynonym].filter(
                  function (v, i, self) {
                    return i == self.indexOf(v)
                  }
                )
                setSynonyms(existingSynonyms)
                const additionalSynonyms = [...addSynonyms, newSynonym].filter(
                  function (v, i, self) {
                    return i == self.indexOf(v)
                  }
                )
                setAddSynonyms(additionalSynonyms)
                setNewSynonym('')
              }}
            >
              <Icon.Add role="presentation" /> Add
            </Button>
          </ButtonGroup>
        </FormGroup>
      </Form>
      <Form
        method="POST"
        onSubmit={() => {
          setAddSynonyms([])
          setDeleteSynonyms([])
        }}
      >
        <input type="hidden" name="intent" value="edit" />
        <FormGroup>
          <input type="hidden" name="deleteSynonyms" value={deleteSynonyms} />
          <input type="hidden" name="addSynonyms" value={addSynonyms} />
          <ul className="usa-list usa-list--unstyled">
            {synonyms?.map((synonym) => (
              <li key={synonym}>
                <ButtonGroup>
                  {synonym}
                  <Button
                    className="usa-button--unstyled"
                    type="button"
                    onClick={() => {
                      setDeleteSynonyms((oldArray) => [...oldArray, synonym])
                      setSynonyms(
                        synonyms.filter(function (item) {
                          return item !== synonym
                        })
                      )
                      setAddSynonyms(
                        synonyms.filter(function (item) {
                          return item !== synonym
                        })
                      )
                    }}
                  >
                    <Icon.Delete aria-label="Delete" />
                  </Button>
                </ButtonGroup>
              </li>
            ))}
          </ul>
        </FormGroup>
        <FormGroup>
          <Button
            type="submit"
            disabled={!addSynonyms.length && !deleteSynonyms.length}
          >
            Save
          </Button>
        </FormGroup>
      </Form>
    </>
  )
}
