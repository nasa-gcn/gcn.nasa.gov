/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  GridContainer,
  Icon,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { createSynonyms } from './_gcn.synonyms/synonyms.server'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const synonyms = getFormDataString(data, 'synonyms')
    ?.split(',')
    .filter(Boolean)
  if (!synonyms || synonyms.length === 0) {
    return redirect('/synonyms')
  }
  const synonymId = await createSynonyms({ synonyms })
  return redirect(`/synonyms/${synonymId}`)
}

export default function () {
  const [synonyms, setSynonyms] = useState([] as string[])
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
        </ButtonGroup>
        <Card
          headerFirst
          className="usa-list--unstyled"
          gridLayout={{ tablet: { col: 6 } }}
        >
          <CardHeader className="bg-base-lightest">
            <h3 className="usa-card__heading">Create a Synonym Group</h3>
          </CardHeader>
          <CardBody>
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
                      setNewSynonym('')
                    }}
                  >
                    <Icon.Add /> Add Event
                  </Button>
                </ButtonGroup>
              </FormGroup>
            </Form>
            <Form
              method="POST"
              onSubmit={() => {
                setSynonyms([])
              }}
            >
              <FormGroup>
                <input type="hidden" name="synonyms" value={synonyms} />
                <ul className="usa-list usa-list--unstyled">
                  {synonyms?.map((synonym) => (
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
                          <Icon.Delete />
                        </Button>
                      </ButtonGroup>
                    </li>
                  ))}
                </ul>
              </FormGroup>
              <FormGroup>
                <Button type="submit" disabled={!(synonyms.length > 1)}>
                  Create Synonym
                </Button>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>
      </GridContainer>
    </>
  )
}
