/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import {
  Button,
  FormGroup,
  GridContainer,
  InputGroup,
  Label,
  TextInput,
  Textarea,
} from '@trussworks/react-uswds'
import { useState } from 'react'

import { getUser } from './_auth/user.server'
import { adminGroup } from './admin'
import Hint from '~/components/Hint'
import { createTeam } from '~/lib/teams.server'
import { getFormDataString } from '~/lib/utils'
import { usePermissionAdmin } from '~/root'

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user || !user.groups.includes(adminGroup))
    throw new Response(null, { status: 403 })
  const data = await request.formData()
  const teamName = getFormDataString(data, 'teamName')
  const description = getFormDataString(data, 'description')
  const pocEmail = getFormDataString(data, 'pocEmail')
  const topicName = getFormDataString(data, 'topicName')
  if (!teamName || !description || !pocEmail || !topicName)
    throw new Response(null, { status: 400 })
  await createTeam(user, teamName, description, pocEmail, topicName)
  return null
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  return null
}

function topicIsValid(topicName: string): Boolean {
  return (
    !topicName.includes(' ') &&
    topicName.startsWith('gcn.notices.') &&
    !topicName.endsWith('.')
  )
}

const topicPrefix = 'gcn.notices.'

export default function () {
  const [topicName, setTopicName] = useState(topicPrefix)
  const topicValid = topicIsValid(topicName)
  const userIsAdmin = usePermissionAdmin()
  return (
    <GridContainer>
      <h1>New Kafka Team</h1>
      <Form method="POST">
        <Label htmlFor="teamName">Team Name</Label>
        <TextInput
          autoFocus
          type="text"
          name="teamName"
          id="teamName"
          required
        />
        <Label htmlFor="teamDescription">Team Description</Label>
        <Textarea name="teamDescription" id="teamDescription" required />
        <Label htmlFor="pocEmail">Point of Contact Email Address</Label>
        <Hint id="pocHint">
          This user will immediately be invited to join this new team with Admin
          permissions. They will be able to make updates and invite other member
          to this team.
        </Hint>
        <TextInput
          type="email"
          name="pocEmail"
          id="pocEmail"
          required
          aria-describedby="pocHint"
        />
        <Label htmlFor="topicName">Topic Name</Label>
        <Hint id="topicHint">
          This will be the prefix for topics to which this team will have
          private Consumer and Producer access. The Topic Name must follow the
          pattern: "gcn.notices.[mission]", all lowercase, and using underscores
          ("_") in place of any spaces. Ex: "gcn.notices.einstein_probe"
        </Hint>
        <InputGroup>
          <TextInput
            type="text"
            name="topicName"
            id="topicName"
            // This allows the UI to intentionally overwrite the entered value
            value={topicName}
            required
            disabled={!userIsAdmin}
            aria-describedby="topicHint"
            className={topicValid ? 'usa-input--success' : undefined}
            onChange={({ target: { value } }) => {
              setTopicName(value.toLowerCase().replaceAll(' ', '_'))
            }}
          />
        </InputGroup>
        <FormGroup>
          <Link
            to=".."
            type="button"
            className="usa-button usa-button--outline"
          >
            Back
          </Link>
          <Button type="submit" disabled={!topicValid}>
            Save
          </Button>
        </FormGroup>
      </Form>
    </GridContainer>
  )
}
