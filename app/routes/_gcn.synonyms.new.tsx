// /*!
//  * Copyright © 2023 United States Government as represented by the
//  * Administrator of the National Aeronautics and Space Administration.
//  * All Rights Reserved.
//  *
//  * SPDX-License-Identifier: Apache-2.0
//  */
import { type DataFunctionArgs, redirect } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  FormGroup,
  Grid,
  GridContainer,
  Icon,
  TextInput,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { createSynonyms } from './_gcn.synonyms/synonyms.server'
import Hint from '~/components/Hint'
import { getFormDataString } from '~/lib/utils'

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const synonyms = getFormDataString(data, 'eventCsv')
    ?.split(',')
    .filter(Boolean)
  if (!synonyms || synonyms.length === 0) {
    return redirect('/synonyms')
  }
  const synonymId = await createSynonyms({ synonyms })
  return redirect(`/synonyms/${synonymId}`)
}

export default function () {
  const [interactedWith, setInteractedWith] = useState(false)
  return (
    <>
      <GridContainer>
        <Grid row>
          <Link to={`/synonyms`} className="usa-button">
            <div className="position-relative">
              <Icon.ArrowBack
                role="presentation"
                className="position-absolute top-0 left-0"
              />
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Back
          </Link>
        </Grid>
      </GridContainer>
      <h1>Create Synonyms</h1>
      <Form method="POST">
        <FormGroup>
          <Hint>
            Enter a comma separated list of event IDs that are synonymous with
            each other.
          </Hint>
          <TextInput
            autoFocus
            aria-describedby="synonym csv input"
            className="usa-input"
            type="text"
            placeholder="comma separated event ids"
            name="eventCsv"
            id="edit-input"
            onChange={(e) => {
              if (e.target.value) {
                setInteractedWith(true)
              }
            }}
          />
          <ButtonGroup className="margin-top-2">
            <Button type="submit" disabled={!interactedWith}>
              Create
            </Button>
          </ButtonGroup>
        </FormGroup>
      </Form>
    </>
  )
}
