/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { Button, Icon, Label, TextInput } from '@trussworks/react-uswds'
import { useState } from 'react'

import { updatePassword } from './password.server'
import Spinner from '~/components/Spinner'
import { getFormDataString } from '~/lib/utils'

export const handle = {
  breadcrumb: 'Password',
  getSitemapEntries: () => null,
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const oldPassword = getFormDataString(data, 'oldPassword')
  const newPassword = getFormDataString(data, 'newPassword')
  const confirmPassword = getFormDataString(data, 'confirmPassword')

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new Response('all password fields must be present', { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    throw new Response('passwords must match', { status: 400 })
  } else {
    await updatePassword(request, oldPassword, newPassword)

    return null
  }
}

export default function () {
  const fetcher = useFetcher<typeof action>()
  const checkPassword = (str: string) => {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    return re.test(str)
  }
  const startsOrEndsWithWhitespace = (str: string) => {
    return /^\s|\s$/.test(str)
  }
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false)
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] =
    useState(false)
  const passwordsMatch = newPassword === confirmPassword
  const passwordsAreEmpty = !newPassword && !confirmPassword
  const shouldDisableSubmit =
    passwordsAreEmpty || !isNewPasswordTouched || !passwordsMatch
  const isMatchError =
    !isConfirmPasswordTouched || passwordsMatch ? '' : 'usa-input--error'
  const valid =
    !startsOrEndsWithWhitespace(newPassword) && checkPassword(newPassword)
  const isValidPassword =
    !isNewPasswordTouched || valid ? '' : 'usa-input--error'
  const isValidConfirmation =
    passwordsMatch && !passwordsAreEmpty ? 'usa-input--success' : ''
  const containsLower = /[a-z]/.test(newPassword)
  const containsUpper = /[A-Z]/.test(newPassword)
  const containsNumber = /[0-9]/.test(newPassword)
  const validLength = newPassword.length >= 8
  const containsSpecialChar = /[~`!@#$%^&*+=\-_ [\]\\';,/{}()|\\":<>?]/g.test(
    newPassword
  )
  const leadingOrTrailingSpace =
    newPassword.length !== newPassword.trim().length

  return (
    <>
      <h1>Reset Password</h1>
      <>
        <fetcher.Form method="POST">
          <Label htmlFor="oldPassword">Old Password</Label>
          <TextInput
            data-focus
            name="oldPassword"
            id="oldPassword"
            type="password"
            placeholder="Old Password"
          />
          <Label htmlFor="newPassword">New Password</Label>
          <TextInput
            className={isValidPassword}
            name="newPassword"
            id="newPassword"
            type="password"
            placeholder="New Password"
            onChange={(e) => {
              setNewPassword(e.target.value)
              setIsNewPasswordTouched(true)
            }}
            value={newPassword}
          />
          <Label htmlFor="confirmPassword">Retype New Password</Label>
          <TextInput
            className={`${isMatchError} ${isValidConfirmation}`}
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            placeholder="Retype New Password"
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setIsNewPasswordTouched(true)
              setIsConfirmPasswordTouched(true)
            }}
            value={confirmPassword}
          />

          <Button
            className="margin-y-2"
            disabled={shouldDisableSubmit}
            type="submit"
          >
            Reset Password
          </Button>
          {fetcher.state !== 'idle' && (
            <>
              <Spinner /> Saving...
            </>
          )}
          {fetcher.state === 'idle' && fetcher.data !== undefined && (
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
          <ul className="usa-checklist" id="validate-code">
            <li>
              A lower case letter
              {containsLower && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
            </li>
            <li>
              An upper case letter
              {containsUpper && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
            </li>
            <li>
              A number
              {containsNumber && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
            </li>
            <li>
              At least 8 characters
              {validLength && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
            </li>
            <li>
              At least 1 special character or space
              {containsSpecialChar && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
            </li>
            <li>
              No leading or trailing spaces
              {!leadingOrTrailingSpace && (
                <>
                  <Icon.Check color="green" />
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
