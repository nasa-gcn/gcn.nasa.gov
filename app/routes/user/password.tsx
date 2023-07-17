/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import {
  Alert,
  Button,
  ButtonGroup,
  Icon,
  InputGroup,
  Label,
  TextInput,
} from '@trussworks/react-uswds'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'

import { getUser } from '../__auth/user.server'
import { updatePassword } from './password.server'
import PasswordValidationStep from '~/components/PasswordValidationStep'
import Spinner from '~/components/Spinner'
import { getFormDataString } from '~/lib/utils'
import { useUserIdp } from '~/root'

export const handle = {
  breadcrumb: 'Reset Password',
  getSitemapEntries: () => null,
}

export async function loader({ request }: DataFunctionArgs) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  return null
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const oldPassword = getFormDataString(data, 'oldPassword')
  const newPassword = getFormDataString(data, 'newPassword')

  invariant(oldPassword && newPassword)
  return await updatePassword(request, oldPassword, newPassword)
}

export function WrongIdp() {
  return (
    <Alert type="error" heading="Error:" headingLevel="h4">
      You must be signed in with a username and password to reset your password.
    </Alert>
  )
}

export function ResetPassword() {
  const fetcher = useFetcher<typeof action>()
  const errorMessage = fetcher.data

  const [newPassword, setNewPassword] = useState('')
  const [isOldPasswordTouched, setIsOldPasswordTouched] = useState(false)
  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false)
  const [visible, setVisible] = useState(false)

  const containsLower = /[a-z]/.test(newPassword)
  const containsUpper = /[A-Z]/.test(newPassword)
  const containsNumber = /[0-9]/.test(newPassword)
  const validLength = newPassword.length >= 8
  const whitespaceValid = !/^\s|\s$/.test(newPassword)
  const containsSpecialChar = /[~`!@#$%^.&*+=\-_ [\]\\';,/{}()|\\":<>?]/g.test(
    newPassword
  )

  const oldPasswordError = errorMessage && !isOldPasswordTouched
  const valid =
    whitespaceValid &&
    containsLower &&
    containsUpper &&
    containsNumber &&
    validLength &&
    containsSpecialChar
  const shouldDisableSubmit =
    !newPassword || !isNewPasswordTouched || !valid || !isOldPasswordTouched
  let isError
  if (isNewPasswordTouched && valid) {
    isError = false
  }
  if (isNewPasswordTouched && !valid) {
    isError = true
  }
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (formRef.current && fetcher.state === 'submitting') {
      formRef.current.reset()
    }
  }, [fetcher.state])

  return (
    <>
      <h1>Reset Password</h1>
      <>
        <fetcher.Form method="POST" ref={formRef}>
          <Label htmlFor="oldPassword">Old Password</Label>
          <TextInput
            data-focus
            className={oldPasswordError ? 'usa-input--error' : ''}
            name="oldPassword"
            id="oldPassword"
            type="password"
            placeholder="Old Password"
            onChange={(e) => {
              setIsOldPasswordTouched(true)
            }}
          />
          {errorMessage === 'NotAuthorizedException' && (
            <span className="text-red">Invalid Password</span>
          )}
          {errorMessage === 'LimitExceededException' && (
            <span className="text-red">
              Attempts Exceeded. Please try again later.
            </span>
          )}
          <Label htmlFor="newPassword">New Password</Label>
          <InputGroup error={isError}>
            <TextInput
              name="newPassword"
              id="newPassword"
              className={
                !isError && isNewPasswordTouched ? 'usa-input--success' : ''
              }
              type={visible ? 'text' : 'password'}
              placeholder="New Password"
              onChange={(e) => {
                setNewPassword(e.target.value)
                setIsNewPasswordTouched(true)
              }}
              value={newPassword}
            />
            <div className="usa-input-suffix" aria-hidden="true">
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
          <ButtonGroup>
            <Button
              disabled={shouldDisableSubmit}
              type="submit"
              className="margin-y-2"
            >
              Reset Password
            </Button>
          </ButtonGroup>
          {fetcher.state !== 'idle' && (
            <>
              <Spinner /> Saving...
            </>
          )}
          {fetcher.state === 'idle' &&
            fetcher.data !== undefined &&
            fetcher.data !== 'NotAuthorizedException' &&
            fetcher.data !== 'LimitExceededException' && (
              <>
                <Icon.Check color="green" /> Saved
              </>
            )}
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
