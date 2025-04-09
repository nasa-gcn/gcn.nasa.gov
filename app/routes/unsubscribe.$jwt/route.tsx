/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { SEOHandle } from '@nasa-gcn/remix-seo'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormGroup,
  GridContainer,
} from '@trussworks/react-uswds'
import capitalize from 'lodash/capitalize'
import { useState } from 'react'

import { unsubscribeActions } from './actions.server'
import { maxTokenAge } from './jwt.lib'
import { decodeFromURLParams } from './jwt.server'
import Hint from '~/components/Hint'
import { joinListWithOxfordComma } from '~/lib/utils'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Unsubscribe',
  getSitemapEntries: () => null,
}

export async function loader({ params }: LoaderFunctionArgs) {
  const availableTopics = Object.keys(unsubscribeActions)
  const decoded = await decodeFromURLParams(params)
  return { availableTopics, ...decoded }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const [{ email }, formData] = await Promise.all([
    decodeFromURLParams(params),
    request.formData(),
  ])
  const entries = Object.entries(unsubscribeActions).filter(([key]) =>
    formData.has(key)
  )
  const keys = entries.map(([key]) => key)
  await Promise.all(entries.map(([, value]) => value(email)))
  return keys
}

function UnsubscribeForm({
  topics,
  availableTopics,
}: {
  topics: string[]
  availableTopics: string[]
}) {
  const [checkState, setCheckState] = useState(
    availableTopics.map((key) => topics.includes(key))
  )
  const disabled = checkState.every((checked) => !checked)

  return (
    <Form method="POST">
      <p className="usa-paragraph">
        Which GCN messages would you like to unsubscribe from? Select one or
        more options.
      </p>
      {availableTopics.map((key, i) => (
        <Checkbox
          id={key}
          name={key}
          key={key}
          label={capitalize(key)}
          defaultChecked={topics.includes(key)}
          onChange={({ target: { checked } }) => {
            setCheckState(checkState.map((old, j) => (i === j ? checked : old)))
          }}
        />
      ))}
      <br />
      <Hint>
        After submitting this form, you{' '}
        {disabled || (
          <>
            will no longer receive GCN{' '}
            {joinListWithOxfordComma(
              availableTopics.filter((key, i) => checkState[i]).map(capitalize),
              'or'
            )}
            , but you
          </>
        )}{' '}
        may still receive limited notifications related to your account (for
        example, for password recovery requests).
      </Hint>
      <FormGroup>
        <ButtonGroup>
          <Link to="/" className="usa-button usa-button--outline">
            Cancel
          </Link>
          <Button type="submit" disabled={disabled}>
            Unsubscribe
          </Button>
        </ButtonGroup>
      </FormGroup>
    </Form>
  )
}

function UnsubscribeConfirmation({ actionsTaken }: { actionsTaken: string[] }) {
  return (
    <>
      <p className="usa-intro">You have been unsubscribed.</p>
      <p className="usa-paragraph">
        You will no longer receive GCN{' '}
        {joinListWithOxfordComma(actionsTaken.map(capitalize), 'or')}.
      </p>
      <FormGroup>
        <ButtonGroup>
          <Link to="/" className="usa-button">
            Go Home
          </Link>
        </ButtonGroup>
      </FormGroup>
    </>
  )
}

export default function () {
  const { email, topics, availableTopics } = useLoaderData<typeof loader>()
  const actionsTaken = useActionData<typeof action>()

  return (
    <GridContainer className="usa-section">
      <h1>Unsubscribe {email} from GCN</h1>
      {actionsTaken ? (
        <UnsubscribeConfirmation actionsTaken={actionsTaken} />
      ) : (
        <UnsubscribeForm topics={topics} availableTopics={availableTopics} />
      )}
    </GridContainer>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 400) {
    return (
      <GridContainer className="usa-section">
        <h1>Unsubscribe from Emails</h1>
        <p className="usa-intro">
          Your unsubscribe link has expired or is invalid.
        </p>
        <p className="usa-paragraph">
          Unsubscribe links are valid for {maxTokenAge}. Please find an
          unsubscribe link from a newer email message.
        </p>
        <FormGroup>
          <ButtonGroup>
            <Link to="/" className="usa-button">
              Go home
            </Link>
          </ButtonGroup>
        </FormGroup>
      </GridContainer>
    )
  } else {
    throw error
  }
}
