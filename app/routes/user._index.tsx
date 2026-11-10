/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import type { ModalRef } from '@trussworks/react-uswds'
import {
  Alert,
  Button,
  FormGroup,
  Grid,
  Icon,
  Label,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  Tag,
  TextInput,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'

import { storage } from './_auth/auth.server'
import { getUser, updateSession } from './_auth/user.server'
import { formatAuthor } from './circulars/circulars.lib'
import Hint from '~/components/Hint'
import Spinner from '~/components/Spinner'
import { ToolbarButtonGroup } from '~/components/ToolbarButtonGroup'
import { cognito, maybeThrowCognito } from '~/lib/cognito.server'
import { sendUserEmailVerificationMessage } from '~/lib/email.server'
import { feature } from '~/lib/env.server'
import type { EmailItem } from '~/lib/user.server'
import {
  addNewUserEmail,
  getAllUserEmails,
  removeUserEmailAddress,
  updateUserFields,
} from '~/lib/user.server'
import { getFormDataString } from '~/lib/utils'
import { useFeature } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Profile',
  noIndex: true,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })

  const { email, idp, name, affiliation } = user
  const validEmails = await getAllUserEmails(user.sub)
  return { email, idp, name, affiliation, validEmails }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const newEmailsEnabled = feature('MULTI_EMAIL')
  const formData = await request.formData()
  const intent = getFormDataString(formData, 'intent')
  if (!intent) throw new Response(null, { status: 400 })
  const address = getFormDataString(formData, 'address')
  let displayConfirmationEmailAlert = false
  switch (intent) {
    case 'update-user':
      const session = await storage.getSession(request.headers.get('Cookie'))
      const name = getFormDataString(formData, 'name') ?? ''
      const affiliation = getFormDataString(formData, 'affiliation') ?? ''

      const command = new UpdateUserAttributesCommand({
        UserAttributes: [
          {
            Name: 'name',
            Value: name,
          },
          {
            Name: 'custom:affiliation',
            Value: affiliation,
          },
        ],
        AccessToken: session.get('accessToken'),
      })

      try {
        await cognito.send(command)
      } catch (e) {
        maybeThrowCognito(e, 'not saving name and affiliation permanently')
      }
      // This is kinda duplicating functionality, but needed to migrate away from cognito
      await updateUserFields(user.sub, name, affiliation)
      user.name = name
      user.affiliation = affiliation
      await updateSession({ user }, session)
      break
    case 'new-email':
      if (!newEmailsEnabled || !address)
        throw new Response(null, { status: 400 })
      await addNewUserEmail(user.sub, address)
      displayConfirmationEmailAlert = true
      break
    case 'remove-address':
      if (!newEmailsEnabled || !address)
        throw new Response(null, { status: 400 })
      await removeUserEmailAddress(user.sub, address)
      break
    case 'verify-address':
      if (!newEmailsEnabled || !address)
        throw new Response(null, { status: 400 })
      await sendUserEmailVerificationMessage(user.sub, address)
      displayConfirmationEmailAlert = true
      break
    default:
      break
  }

  return { displayConfirmationEmailAlert }
}

export default function () {
  const { email, idp, name, affiliation, validEmails } =
    useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const newEmailFetcher = useFetcher<typeof action>()
  const formRef = useRef<HTMLFormElement>(null)
  const [dirty, setDirty] = useState(false)
  const [currentName, setCurrentName] = useState(name)
  const [currentAffiliation, setCurrentAffiliation] = useState(affiliation)
  const disabled = fetcher.state !== 'idle'
  const [emailValid, setEmailValid] = useState(false)
  const newEmailsEnabled = useFeature('MULTI_EMAIL')

  useEffect(() => {
    if (newEmailFetcher.state === 'idle' && newEmailFetcher.data) {
      formRef.current?.reset()
    }
  })

  return (
    <>
      <h1>Welcome, {email}!</h1>
      <p className="usa-paragraph">
        You signed in with {idp || 'username and password'}.
      </p>
      <h2>Profile</h2>
      <fetcher.Form method="POST" onSubmit={() => setDirty(false)}>
        <input type="hidden" name="intent" value="update-user" />
        <p className="usa-paragraph">
          Your profile affects how your name appears in GCN Circulars that you
          submit.
        </p>
        <Label htmlFor="name">Name</Label>
        <Hint id="nameHint">
          How would you like your name to appear in GCN Circulars? For example:
          A. E. Einstein, A. Einstein, Albert Einstein
        </Hint>
        <TextInput
          autoFocus
          aria-describedby="nameHint"
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          disabled={disabled}
          onChange={(e) => {
            setDirty(true)
            setCurrentName(e.target.value)
          }}
        />
        <Label htmlFor="affiliation">Affiliation</Label>
        <Hint id="affiliationHint">
          For example: Pennsylvania State University, Ioffe Institute, DESY,
          Fermi-GBM Team, or AAVSO
        </Hint>
        <TextInput
          aria-describedby="affiliationHint"
          id="affiliation"
          name="affiliation"
          type="text"
          defaultValue={affiliation}
          disabled={disabled}
          onChange={(e) => {
            setDirty(true)
            setCurrentAffiliation(e.target.value)
          }}
        />
        <Label htmlFor="preview">Preview</Label>
        <Hint id="previewHint">
          This is how the "From" field will be shown in GCN Circulars that you
          submit.
        </Hint>
        <p aria-describedby="previewHint" id="preview" className="margin-top-0">
          {formatAuthor({
            name: currentName,
            affiliation: currentAffiliation,
            email,
          })}
        </p>
        <FormGroup>
          <Button className="usa-button" type="submit" disabled={disabled}>
            Save
          </Button>
          {fetcher.state !== 'idle' && (
            <span className="text-middle">
              <Spinner /> Saving...
            </span>
          )}
          {fetcher.state === 'idle' && fetcher.data !== undefined && !dirty && (
            <span className="text-middle">
              <Icon.Check role="presentation" color="green" /> Saved
            </span>
          )}
        </FormGroup>
      </fetcher.Form>
      {newEmailsEnabled && (
        <>
          <hr />
          <h2>Email Addresses</h2>
          {newEmailFetcher.data?.displayConfirmationEmailAlert && (
            <Alert type="info" headingLevel="h3" slim>
              A Verification email has been sent to the provided address. Please
              check your inbox to confirm this addition.
            </Alert>
          )}
          <p className="usa-paragraph">
            You may associate other email addresses with your account. Only
            verified email addresses may recieve email notifications.
          </p>
          {validEmails.map((item) => (
            <EmailForm key={item.address} item={item} />
          ))}
          <newEmailFetcher.Form method="POST" ref={formRef}>
            <input type="hidden" name="intent" value="new-email" />
            <Label htmlFor="address">Add New Address</Label>
            <TextInput
              id="address"
              name="address"
              type="email"
              autoCapitalize="off"
              autoCorrect="off"
              required
              placeholder="email"
              disabled={newEmailFetcher.state !== 'idle'}
              onChange={(e) => {
                setEmailValid(
                  !validEmails.some((x) => x.address === e.target.value)
                )
              }}
            />
            <FormGroup>
              <Button
                type="submit"
                disabled={newEmailFetcher.state !== 'idle' || !emailValid}
              >
                Add
              </Button>
            </FormGroup>
          </newEmailFetcher.Form>
        </>
      )}
    </>
  )
}

function EmailForm({ item }: { item: EmailItem }) {
  const updateEmailsFetcher = useFetcher<typeof action>()
  const ref = useRef<ModalRef>(null)
  const verifyRef = useRef<ModalRef>(null)

  return (
    <>
      <Grid row className="flex-align-center">
        <div className="tablet:grid-col flex-fill">
          <div>
            <strong>{item.address}</strong>
          </div>
          <div>
            {item.verified ? (
              <Tag className="bg-success">
                Verified
                <Icon.Check />
              </Tag>
            ) : (
              <Tag className="bg-warning">
                Not Verified
                <Icon.ErrorOutline />
              </Tag>
            )}
          </div>
        </div>
        <div className="tablet:grid-col flex-auto margin-y-auto">
          <ToolbarButtonGroup>
            {!item.verified && (
              <ModalToggleButton
                opener
                modalRef={verifyRef}
                type="button"
                className="usa-button-outline"
                disabled={updateEmailsFetcher.state !== 'idle'}
              >
                Resend Verification Email
              </ModalToggleButton>
            )}
            <ModalToggleButton
              opener
              modalRef={ref}
              type="button"
              className="usa-button--secondary"
              disabled={updateEmailsFetcher.state !== 'idle'}
            >
              Remove
            </ModalToggleButton>
          </ToolbarButtonGroup>
        </div>
      </Grid>
      <Modal
        id="modal-delete"
        ref={ref}
        aria-labelledby="modal-delete-heading"
        aria-describedby="modal-delete-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <updateEmailsFetcher.Form method="POST">
          <input type="hidden" name="address" value={item.address} />
          <input type="hidden" name="intent" value="remove-address" />
          <ModalHeading id="modal-delete-heading">Remove Email</ModalHeading>
          <p id="modal-delete-description">
            Are you sure that you want to remove this email address from your
            list of verified addresses? If you want to add it back in the
            future, you will need to verify the address again.
          </p>
          <ModalFooter>
            <ModalToggleButton modalRef={ref} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Remove
            </Button>
          </ModalFooter>
        </updateEmailsFetcher.Form>
      </Modal>
      <Modal
        id="modal-verify"
        ref={verifyRef}
        aria-labelledby="modal-verify-heading"
        aria-describedby="modal-verify-description"
        renderToPortal={false} // FIXME: https://github.com/trussworks/react-uswds/pull/1890#issuecomment-1023730448
      >
        <updateEmailsFetcher.Form method="POST">
          <input type="hidden" name="address" value={item.address} />
          <input type="hidden" name="intent" value="verify-address" />
          <ModalHeading id="modal-verify-heading">Verify Email</ModalHeading>
          <p id="modal-verify-description">Resend confirmation email</p>
          <ModalFooter>
            <ModalToggleButton modalRef={verifyRef} closer outline>
              Cancel
            </ModalToggleButton>
            <Button data-close-modal type="submit">
              Send
            </Button>
          </ModalFooter>
        </updateEmailsFetcher.Form>
      </Modal>
    </>
  )
}
