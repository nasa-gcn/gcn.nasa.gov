// /*!
//  * Copyright © 2023 United States Government as represented by the
//  * Administrator of the National Aeronautics and Space Administration.
//  * All Rights Reserved.
//  *
//  * SPDX-License-Identifier: Apache-2.0
//  */
import { type DataFunctionArgs, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
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

import {
  deleteSynonyms,
  getBySynonymId,
  putSynonyms,
} from './_gcn.synonyms/synonyms.server'
import Hint from '~/components/Hint'
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
    const synonyms = getFormDataString(data, 'eventCsv')?.split(',')
    const oldSynonyms = getFormDataString(data, 'oldSynonyms')?.split(',') || []
    await putSynonyms({ synonymId, synonyms, oldSynonyms })
    return redirect(`/synonyms/${synonymId}`)
  }
  if (intent === 'delete') {
    await deleteSynonyms({ synonymId })
    return redirect('/synonyms')
  }
  return null
}

function Edit({
  eventIds,
  synonymId,
}: {
  eventIds: string[]
  synonymId: string
}) {
  return (
    <>
      <Form method="POST">
        <FormGroup>
          <Hint>
            Synonym lists are synonymous event ids separated by a comma.
          </Hint>
          <input type="hidden" name="intent" value="edit" />
          <input type="hidden" name="synonymId" value={synonymId} />
          <input type="hidden" name="oldSynonyms" value={eventIds} />
          <TextInput
            autoFocus
            aria-describedby="synonym csv input"
            defaultValue={eventIds.join(', ')}
            className="usa-input"
            type="text"
            placeholder="comma separated event ids"
            name="eventCsv"
            id="edit-input"
          />
        </FormGroup>
        <ButtonGroup className="margin-top-2">
          <Button type="submit">Save</Button>
        </ButtonGroup>
      </Form>
    </>
  )
}

export default function () {
  const { synonymId, eventIds } = useLoaderData<typeof loader>()
  const [isEdit, setIsEdit] = useState(false)

  function onClickIsEdit() {
    setIsEdit(!isEdit)
  }

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
          <Button type="button" onClick={onClickIsEdit}>
            <Icon.Edit className="position-absolute top-0 left-0" />
            Edit
          </Button>
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
        </Grid>
      </GridContainer>

      <h1>{synonymId}</h1>

      <p>The following represent the same event:</p>

      <ul>{eventIds?.map((synonym) => <li key={synonym}>{synonym}</li>)}</ul>
      {isEdit && synonymId && (
        <Edit eventIds={eventIds} synonymId={synonymId} />
      )}
    </>
  )
}
