/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import {
  Alert,
  Button,
  FormGroup,
  Icon,
  InputGroup,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'

import { getUser } from '../_auth/user.server'
import { updatePassword } from './password.server'
import Spinner from '~/components/Spinner'
import { getFormDataString } from '~/lib/utils'
import { useEmail, useUserIdp } from '~/root'
import type { BreadcrumbHandle } from '~/root/Title'
import type { SEOHandle } from '~/root/seo'

export const handle: BreadcrumbHandle & SEOHandle = {
  breadcrumb: 'Reset Password',
  noIndex: true,
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData()
  const oldPassword = getFormDataString(data, 'current-password')
  const newPassword = getFormDataString(data, 'new-password')

  invariant(oldPassword && newPassword)
  return await updatePassword(request, oldPassword, newPassword)
}

function WrongIdp() {
  return (
    <Alert type="error" heading="Error:" headingLevel="h4">
      You must be signed in with a username and password to reset your password.
    </Alert>
  )
}

function PasswordValidationStep({
  valid,
  text,
}: {
  valid: boolean
  text: string
}) {
  return (
    <li>
      {valid ? (
        <Icon.Check color="green" aria-label="Passed" />
      ) : (
        <Icon.Close color="red" aria-label="Failed" />
      )}
      {text}
    </li>
  )
}

function ErrorMessage({
  errorMessage,
  isOldPasswordTouched,
  interacted,
  fetcherState,
}: {
  errorMessage: unknown
  isOldPasswordTouched: boolean
  interacted: boolean
  fetcherState: string
}) {
  const errorState =
    !isOldPasswordTouched && !interacted && fetcherState !== 'submitting'
  if (errorMessage === 'NotAuthorizedException' && errorState) {
    return <div className="text-red">Invalid Password</div>
  } else if (errorMessage === 'LimitExceededException' && errorState) {
    return (
      <div className="text-red">Attempts Exceeded. Please try again later.</div>
    )
  } else {
    return <div>&nbsp;</div>
  }
}

function ResetPassword() {
  const fetcher = useFetcher<typeof action>()
  const errorMessage = fetcher.data

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false)
  const [visible, setVisible] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const [isOldPasswordTouched, setIsOldPasswordTouched] = useState(false)

  const containsLower = /[a-z]/.test(newPassword)
  const containsUpper = /[A-Z]/.test(newPassword)
  const containsNumber = /[0-9]/.test(newPassword)
  const validLength = newPassword.length >= 8
  const whitespaceValid = !/^\s|\s$/.test(newPassword)
  const containsSpecialChar = /[~`!@#$%^.&*+=\-_ [\]\\';,/{}()|\\":<>?]/g.test(
    newPassword
  )
  const isOldPasswordError =
    !isOldPasswordTouched && errorMessage && fetcher.state !== 'submitting'
  const valid =
    whitespaceValid &&
    containsLower &&
    containsUpper &&
    containsNumber &&
    validLength &&
    containsSpecialChar
  const shouldDisableSubmit = !valid || !oldPassword

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setInteracted(false)
      setIsOldPasswordTouched(false)
    }
    if (fetcher.state === 'idle' && fetcher.data === null && formRef.current) {
      formRef.current.reset()
      setInteracted(false)
    } else if (formRef && formRef.current) {
      // this works around autofill on the old password field for all browsers
      setOldPassword((formRef.current[0] as HTMLInputElement).value || '')
    }
  }, [fetcher.state, fetcher.data])

  return (
    <>
      <h1>Reset Password</h1>
      <>
        <fetcher.Form method="POST" ref={formRef}>
          <input
            type="hidden"
            name="username"
            autoComplete="username"
            value={useEmail()}
          />
          <Label htmlFor="current-password">Old Password</Label>
          <TextInput
            data-focus
            name="current-password"
            className={isOldPasswordError ? 'usa-input--error' : ''}
            id="current-password"
            type="password"
            placeholder="Old Password"
            autoComplete="current-password"
            onChange={(e) => {
              setOldPassword(e.target.value)
              setInteracted(true)
              setIsOldPasswordTouched(true)
            }}
          />
          <ErrorMessage
            errorMessage={errorMessage}
            isOldPasswordTouched={isOldPasswordTouched}
            interacted={interacted}
            fetcherState={fetcher.state}
          />
          <Label htmlFor="new-password" className="margin-top-105">
            New Password
          </Label>
          <InputGroup error={isNewPasswordTouched && !valid}>
            <TextInput
              name="new-password"
              id="new-password"
              type={visible ? 'text' : 'password'}
              placeholder="New Password"
              autoComplete="new-password"
              onChange={(e) => {
                setNewPassword(e.target.value)
                setIsNewPasswordTouched(true)
                setInteracted(true)
              }}
            />
            <div className="usa-input-suffix">
              {visible ? (
                <Icon.VisibilityOff
                  className="margin-y-2"
                  aria-label="Hide password"
                  onClick={() => {
                    setVisible(!visible)
                  }}
                />
              ) : (
                <Icon.Visibility
                  className="margin-y-2"
                  aria-label="Show password"
                  onClick={() => {
                    setVisible(!visible)
                  }}
                />
              )}
            </div>
          </InputGroup>
          <FormGroup>
            <Button disabled={shouldDisableSubmit} type="submit">
              Reset Password
            </Button>
            {fetcher.state !== 'idle' && (
              <>
                <Spinner className="text-middle" /> Saving...
              </>
            )}
            {fetcher.state === 'idle' &&
              fetcher.data === null &&
              !interacted && (
                <>
                  <Icon.Check
                    role="presentation"
                    className="text-middle"
                    color="green"
                  />{' '}
                  Saved
                </>
              )}
          </FormGroup>
        </fetcher.Form>
      </>
      <div className="usa-alert usa-alert--info usa-alert--validation">
        <div className="usa-alert__body">
          <h3 className="site-preview-heading margin-0 usa-alert__heading">
            New password must contain:
          </h3>
          <ul className="usa-checklist">
            <PasswordValidationStep
              valid={containsLower}
              text="A lower case letter"
            />
            <PasswordValidationStep
              valid={containsUpper}
              text="An upper case letter"
            />
            <PasswordValidationStep valid={containsNumber} text="A number" />
            <PasswordValidationStep
              valid={validLength}
              text="At least 8 characters"
            />
            <PasswordValidationStep
              valid={containsSpecialChar}
              text="At least 1 special character or space"
            />
            <PasswordValidationStep
              valid={whitespaceValid}
              text="No leading or trailing space"
            />
          </ul>
        </div>
      </div>
    </>
  )
}

export default function () {
  return useUserIdp() ? WrongIdp() : ResetPassword()
}
