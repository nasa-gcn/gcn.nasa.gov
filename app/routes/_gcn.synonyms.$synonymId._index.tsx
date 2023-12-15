/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type DataFunctionArgs, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  FormGroup,
  GridContainer,
  Icon,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import {
  deleteSynonyms,
  getBySynonymId,
  putSynonyms,
} from './_gcn.synonyms/synonyms.server'
import { getFormDataString } from '~/lib/utils'

export async function loader({ params: { synonymId } }: DataFunctionArgs) {
  if (!synonymId) return { synonymId: null, eventIds: null }
  const synonyms = await getBySynonymId({ synonymId })
  const eventIds = [] as string[]
  synonyms.forEach((synonym) => {
    eventIds.push(synonym.eventId)
  })

  return {
    synonymId,
    eventIds,
  }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const intent = getFormDataString(data, 'intent')
  const synonymId = getFormDataString(data, 'synonymId')
  if (!synonymId) return redirect('/synonyms')
  if (intent === 'edit') {
    const synonyms =
      getFormDataString(data, 'addSynonyms')?.split(',') || ([] as string[])
    const deleteSynonyms =
      getFormDataString(data, 'deleteSynonyms')?.split(',') || ([] as string[])

    await putSynonyms({ synonymId, synonyms, deleteSynonyms })

    return redirect(`/synonyms/${synonymId}`)
  }
  if (intent === 'delete') {
    await deleteSynonyms({ synonymId })

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
      <GridContainer className="usa-section">
        <ButtonGroup className="margin-bottom-2">
          <Link to={`/synonyms`} className="usa-button">
            <div className="position-relative">
              <Icon.ArrowBack
                role="presentation"
                className="position-absolute top-0 left-0"
              />
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
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

        <CardGroup>
          <Card headerFirst gridLayout={{ tablet: { col: 6 } }}>
            <CardHeader className="bg-base-lightest">
              <h3 className="usa-card__heading">Synonym</h3>
            </CardHeader>

            <CardBody>
              <p>
                Synonyms are groups of event ids that represent the same event.
                Add additional event ids to associate new events with this
                synonym.
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
                      <Icon.Add /> Add Event
                    </Button>
                  </ButtonGroup>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
          <Card headerFirst gridLayout={{ tablet: { col: 6 } }}>
            <CardHeader className="bg-base-lightest">
              <h3 className="usa-card__heading">Related Events</h3>
            </CardHeader>

            <CardBody>
              <Form
                method="POST"
                onSubmit={() => {
                  setAddSynonyms([])
                  setDeleteSynonyms([])
                }}
              >
                <input type="hidden" name="intent" value="edit" />
                <input
                  type="hidden"
                  name="synonymId"
                  value={synonymId || undefined}
                />
                <FormGroup>
                  <input
                    type="hidden"
                    name="deleteSynonyms"
                    value={deleteSynonyms}
                  />
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
                              setDeleteSynonyms((oldArray) => [
                                ...oldArray,
                                synonym,
                              ])
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
            </CardBody>
          </Card>
        </CardGroup>
      </GridContainer>
    </>
  )
}
