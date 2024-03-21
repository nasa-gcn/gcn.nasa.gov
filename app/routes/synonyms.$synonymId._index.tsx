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

import {
  deleteSynonyms,
  getSynonymsByUuid,
  putSynonyms,
} from './synonyms/synonyms.server'
import { getFormDataString } from '~/lib/utils'

export async function loader({ params: { synonymId } }: LoaderFunctionArgs) {
  if (!synonymId) return { synonymId: null, eventIds: null }
  const synonyms = await getSynonymsByUuid(synonymId)
  const eventIds = [] as string[]
  synonyms.forEach((synonym) => {
    eventIds.push(synonym.eventId)
  })

  return {
    synonymId,
    eventIds,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  const synonymId = getFormDataString(data, 'synonymId')
  if (!synonymId) return redirect('/synonyms')
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

    return redirect(`/synonyms/${synonymId}`)
  }
  if (intent === 'delete') {
    await deleteSynonyms(synonymId)

    return redirect('/synonyms')
  }
  return null
}

export default function () {
  const { synonymId, eventIds } = useLoaderData<typeof loader>()
  const [deleteSynonyms, setDeleteSynonyms] = useState([] as string[])
  const [synonyms, setSynonyms] = useState(eventIds || [])
  const [addSynonyms, setAddSynonyms] = useState([] as string[])
  const [newSynonym, setNewSynonym] = useState('')

  return (
    <>
      <ButtonGroup>
        <h1>Synonym Group</h1>
        <ButtonGroup className="margin-bottom-2">
          <Link to={`/synonyms`} className="usa-button">
            <div className="display-inline">
              <Icon.ArrowBack
                role="presentation"
                className="position-relative"
              />
            </div>
          </Link>
          <Form method="POST">
            <input type="hidden" name="intent" value="delete" />
            <input
              type="hidden"
              name="synonymId"
              value={synonymId || undefined}
            />
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
                setSynonyms([...synonyms, newSynonym])
                setAddSynonyms([...addSynonyms, newSynonym])
                setNewSynonym('')
              }}
            >
              <Icon.Add /> Add
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
        <input type="hidden" name="synonymId" value={synonymId || undefined} />
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
                    }}
                  >
                    <Icon.Delete />
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
